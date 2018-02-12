'use strict';

const pump = require('pump');

const Brakes = require('brakes');
const addEventListeners = require('brakes-prometheus');
const { PassThrough } = require('readable-stream');
const http = require('http');
const https = require('https');
const url = require('url');

if (process.env.NODE_ENV === 'production') {
    http.globalAgent.keepAlive = true;
    https.globalAgent.keepAlive = true;
    http.globalAgent.options.keepAlive = true;
    https.globalAgent.options.keepAlive = true;
}

const extractHeaders = serviceRes =>
    Array.from(serviceRes.headers).reduce(
        (acc, curr) => Object.assign(acc, { [curr[0]]: curr[1] }),
        {},
    );

exports._SUPPRESSED_ERROR = Symbol('_SUPPRESSED_ERROR');

function copyCookies(cookieNames, parsedCookies, pipeHeaders) {
    let cookieStr = pipeHeaders.cookie || '';
    cookieNames.forEach(key => {
        const value = parsedCookies[key];
        if (!value || cookieStr.includes(key)) {
            // do nothing, nothing to pass on.
            return;
        }
        cookieStr = `${
            cookieStr
                ? `${cookieStr.endsWith(';') ? cookieStr : `${cookieStr};`}`
                : ''
        }${key}=${value};`;
    });

    if (cookieStr) {
        pipeHeaders.cookie = cookieStr;
    }
    return pipeHeaders;
}

exports.pipeServiceFactory = function pipeServiceFactory(
    config,
    retryOptions = {},
    logger,
) {
    // Useful to override this for tests
    // TODO: If we ever turn on caching, this should be lifted up so
    // different pipeservice instances can share cache
    const retry = {
        retries: 1,
        minTimeout: 50,
        maxTimeout: 200,
        ...retryOptions,
    };
    let fetchImpl;

    const fetch = require('make-fetch-happen').defaults({
        cacheManager: null,
        compress: false,
        retry,
    });

    if (config.useZipkin) {
        const { createZipkinTracer } = require('@finn-no/zipkin');
        const wrapFetch = require('zipkin-instrumentation-fetch');

        const tracer = createZipkinTracer(config);

        fetchImpl = wrapFetch(fetch, {
            tracer,
            serviceName: config.appName,
            remoteServiceName: config.zipkinRemoteServiceName,
        });
    } else {
        fetchImpl = fetch;
    }

    // Should probably create a separate break for every call site
    const brake = addEventListeners(
        new Brakes(fetchImpl, {
            group: config.brakesGroup,
            name: config.brakesName,
            isPromise: true,
            // Handled by m-f-h
            timeout: 10e6,
            waitThreshold: 25,
        }),
    );

    brake.on('failure', (time, err) =>
        logger.warn('Pipe service - Request failed', err),
    );
    brake.on('timeout', (time, err) =>
        logger.warn('Pipe service - Request timed out', err),
    );

    return function pipeService({
        req,
        res,
        uri,
        query,
        timeout = 5000,
        transform,
        ignoreClientDisconnects = false,
        method = 'GET',
        headers = {},
    }) {
        // TODO: Should probably return `Promise.reject`, but most consumers don't await the promise here
        if (!req.podiumContext) {
            throw new ReferenceError(
                'Podium context is not set for request. Please add `@podium/context`.',
            );
        }

        if (!transform) {
            transform = (serviceRes, extractedHeaders) => {
                res.status(serviceRes.status);
                res.set(extractedHeaders);
                return new PassThrough();
            };
        }

        const fullUrl = url.format(Object.assign(url.parse(uri), { query }));
        logger.debug(`Calling service ${fullUrl} with method ${method}`);

        const pipeHeaders = Object.assign(
            {
                'User-Agent': '@finn-no/proxy-services',
            },
            req.podiumContext.headers,
            headers,
        );

        if (req.cookies) {
            copyCookies(
                ['USERID', 'SESSION', 'mfinn_jsession'],
                req.cookies,
                pipeHeaders,
            );
        }

        // allow podium-dev-server to not keep connections
        if (process.env.NODE_ENV !== 'production') {
            pipeHeaders.connection = 'close';
        }

        return brake
            .exec(fullUrl, {
                method: method.toUpperCase(),
                timeout,
                body: method === 'POST' ? req : undefined,
                headers: pipeHeaders,
            })
            .then(serviceRes => {
                const { status } = serviceRes;

                const logString = `Server responded to ${
                    serviceRes.url
                } with ${status}`;
                const extractedHeaders = extractHeaders(serviceRes);
                logger.trace(logString, {
                    extras: { extractedHeaders },
                });

                if (!serviceRes.ok) {
                    if (status >= 500) {
                        logger.warn(logString);
                    } else {
                        logger.info(logString);
                    }
                }

                if (res.headersSent) {
                    serviceRes.body.end();
                    throw new Error('Headers already sent.');
                }

                return new Promise((resolve, reject) => {
                    pump(
                        serviceRes.body,
                        transform(serviceRes, extractedHeaders),
                        res,
                        err => {
                            if (err) {
                                if (
                                    ignoreClientDisconnects && // rechecking https://github.com/mafintosh/end-of-stream/blob/0ae1658b8167596fafbb9195363ada3bc5a3eaf2/index.js#L44
                                    err.message === 'premature close' &&
                                    res.socket._writableState &&
                                    (res.socket._writableState.ended ||
                                        res.socket._writableState.errorEmitted)
                                ) {
                                    logger.debug(
                                        `Failed piping result from "${uri}" with code ${
                                            err.code
                                        }`,
                                        err,
                                    );
                                    resolve(exports._SUPPRESSED_ERROR);
                                } else {
                                    reject(err);
                                }
                            } else {
                                resolve();
                            }
                        },
                    );
                });
            })
            .catch(err => {
                logger.error(
                    `Failed piping result from "${uri}" with code ${err.code}`,
                    err,
                );

                if (res.headersSent) {
                    // fixme what here?
                } else {
                    // fixme make better
                    res.sendStatus(503);
                }
            });
    };
};
