import { pathToRegexp } from 'path-to-regexp';
import Metrics from '@metrics/client';
import { URL } from 'url';
import abslog from 'abslog';
import * as schemas from '@podium/schemas';
import * as utils from '@podium/utils';
import Proxy from '@podium/node-http-proxy';

/**
 * @typedef {object} PodiumProxyOptions
 * @property {string} [pathname="/"]
 * @property {string} [prefix="/podium-resource"]
 * @property {number} [timeout=20000]
 * @property {number} [maxAge=Infinity]
 * @property {import('abslog').AbstractLoggerOptions | null} [logger=null]
 */

export default class PodiumProxy {
    #pathname;
    #prefix;
    #log;
    #registry;
    #proxy;
    #metrics;
    #histogram;
    #pathnameEntries;
    #pathnameParser;

    /**
     * @constructor
     * @param {PodiumProxyOptions} options
     */
    constructor({
        pathname = '/',
        prefix = '/podium-resource',
        timeout = 20000,
        logger = null,
    } = {}) {
        this.#pathname = utils.pathnameBuilder(pathname);
        this.#prefix = utils.pathnameBuilder(prefix);
        this.#log = abslog(logger);

        this.#pathnameEntries = [];
        this.#pathnameParser = pathToRegexp(
            utils.pathnameBuilder(
                this.#pathname,
                this.#prefix,
                ':podiumPodletName',
                ':podiumProxyName',
                ':podiumProxyExtras*',
            ),
            this.#pathnameEntries,
        );

        this.#proxy = Proxy.createProxy({
            proxyTimeout: timeout,
        });

        this.#proxy.on('error', (error) => {
            this.#log.error(
                'Error emitted by proxy in @podium/proxy module',
                error,
            );
        });

        this.#registry = new Map();

        this.#metrics = new Metrics();
        this.#metrics.on('error', (error) => {
            this.#log.error(
                'Error emitted by metric stream in @podium/proxy module',
                error,
            );
        });
        this.#histogram = this.#metrics.histogram({
            name: 'podium_proxy_process',
            description: 'Measures time spent in the proxy process method',
            labels: {
                name: '',
                podlet: null,
                proxy: false,
                error: false,
            },
            buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 10],
        });
    }

    get pathname() {
        return this.#pathname;
    }

    get prefix() {
        return this.#prefix;
    }

    get metrics() {
        return this.#metrics;
    }

    get registry() {
        return this.#registry;
    }

    /**
     * Register a podlet in the proxy. This will read the proxy configuration from the manifest.
     * @param {string} name
     * @param {import('@podium/schemas').PodletManifestSchema} manifest
     */
    register(name, manifest) {
        if (schemas.name(name).error)
            throw new Error(
                'The value for the required argument "name" is not defined or not valid.',
            );

        // Do a stringify to hande that a @podium/podlet instance is passed in.
        const obj = JSON.parse(JSON.stringify(manifest));

        if (schemas.manifest(obj).error)
            throw new Error(
                'The value for the required argument "manifest" is not defined or not valid.',
            );

        if (Array.isArray(obj.proxy)) {
            obj.proxy.forEach((item) => {
                this.#registry.set(`${name}/${item.name}`, item.target);

                const path = utils.pathnameBuilder(
                    this.#pathname,
                    this.#prefix,
                    name,
                    item.name,
                );
                this.#log.debug(
                    `a proxy endpoint is mounted at pathname: ${path} pointing to: ${item.target}`,
                );
            });
        } else {
            // NOTE: This can be removed when the object notation is removed from the schema
            //       and the manifest only support an array for the proxy property.
            Object.keys(obj.proxy).forEach((key) => {
                this.#registry.set(`${name}/${key}`, obj.proxy[key]);

                const path = utils.pathnameBuilder(
                    this.#pathname,
                    this.#prefix,
                    name,
                    key,
                );
                this.#log.debug(
                    `a proxy endpoint is mounted at pathname: ${path} pointing to: ${obj.proxy[key]}`,
                );
            });
        }
    }

    /**
     * @param {import('@podium/utils').HttpIncoming} incoming
     * @returns {Promise<import('@podium/utils').HttpIncoming | undefined>} The incoming request with the `.proxy` property set to true if successfully proxied, or `undefined` if the incoming request didn't match anything registered in the proxy.
     */
    process(incoming) {
        if (
            Object.prototype.toString.call(incoming) !==
            '[object PodiumHttpIncoming]'
        ) {
            throw TypeError('Argument must be of type "PodiumHttpIncoming"');
        }

        const endTimer = this.#histogram.timer({
            labels: {
                name: incoming.name,
            },
        });

        return new Promise((resolve, reject) => {
            const match = this.#pathnameParser.exec(incoming.url.pathname);
            let errored = false;

            if (match) {
                if (incoming.request.headers.trailer) {
                    incoming.response.writeHead(400);
                    incoming.response.end();
                    return;
                }

                // Turn matched uri parameters into an object of parameters
                const params = {};
                for (let i = 1; i < match.length; i += 1) {
                    const key = this.#pathnameEntries[i - 1];
                    params[key.name] = match[i];
                }

                const key = `${params.podiumPodletName}/${params.podiumProxyName}`;

                // See if podlet has a matching proxy entry.
                // If so we want to proxy. If not, skip rest of processing
                if (!this.#registry.has(key)) {
                    endTimer({ labels: { podlet: params.podiumPodletName } });
                    resolve(incoming);
                    return;
                }

                let target = this.#registry.get(key);

                // See if proxy entry is relative or not.
                // In a layout server it will never be relative since the
                // client will resolve relative paths in the manifest.
                // Iow: this will only hit in a podlet in development mode,
                // so we resolve back to the local host.
                if (utils.uriIsRelative(target)) {
                    target = utils.uriBuilder(
                        target,
                        `${incoming.url.protocol}//${incoming.url.hostname}${
                            incoming.url.port ? ':' : ''
                        }${incoming.url.port}`,
                    );
                }

                // Append extra paths from the original URL to the proxy
                // target pathname
                if (params.podiumProxyExtras) {
                    target = utils.uriBuilder(params.podiumProxyExtras, target);
                }

                // Append query params from the original URL to the proxy
                // target pathname
                if (incoming.url.search) {
                    target += `${incoming.url.search}`;
                }

                // Append context
                utils.serializeContext(
                    incoming.request.headers,
                    incoming.context,
                    params.podiumPodletName,
                );

                const parsed = new URL(target);

                const config = {
                    changeOrigin: false,
                    autoRewrite: true,
                    ignorePath: true,
                    secure: false,
                    headers: {
                        host: parsed.host,
                    },
                    target,
                };

                incoming.response.on('finish', () => {
                    // The finish event will be called after error, prevent
                    // resolving and metrics being called after an error
                    if (errored) return;

                    incoming.proxy = true;
                    endTimer({
                        labels: {
                            podlet: params.podiumPodletName,
                            proxy: true,
                        },
                    });
                    resolve(incoming);
                });

                this.#proxy.web(
                    incoming.request,
                    incoming.response,
                    config,
                    (error) => {
                        errored = true;
                        endTimer({
                            labels: {
                                podlet: params.podiumPodletName,
                                proxy: true,
                                error: true,
                            },
                        });
                        reject(error);
                    },
                );

                return;
            }
            endTimer();
            resolve(incoming);
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumProxy';
    }
}
