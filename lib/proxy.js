'use strict';

const pathRegex = require('path-to-regexp');
const schemas = require('@podium/schemas');
const Metrics = require('@metrics/client');
const { URL } = require('url');
const abslog = require('abslog');
const utils = require('@podium/utils');
const Cache = require('ttl-mem-cache');
const Proxy = require('http-proxy');
// const http = require('http');
const joi = require('joi');

const State = require('./state');

/*
const HTTP_AGENT = new http.Agent({
    keepAlive: true,
    maxSockets: 10,
    maxFreeSockets: 10,
    timeout: 60000,
    keepAliveMsecs: 30000,
});
*/

const PodiumProxy = class PodiumProxy {
    constructor({
        pathname = '/',
        prefix = '/podium-resource',
        timeout = 20000,
        maxAge = Infinity,
        // agent = HTTP_AGENT,
        logger = null,
    } = {}) {
        Object.defineProperty(this, 'pathname', {
            enumerable: true,
            value: utils.pathnameBuilder(pathname),
        });

        Object.defineProperty(this, 'prefix', {
            enumerable: true,
            value: utils.pathnameBuilder(prefix),
        });

        Object.defineProperty(this, 'log', {
            value: abslog(logger),
        });

        Object.defineProperty(this, 'registry', {
            value: new Cache({
                ttl: maxAge,
            }),
        });

        Object.defineProperty(this, 'proxy', {
            // eslint-disable-next-line new-cap
            value: new Proxy.createProxy({
                proxyTimeout: timeout,
                // agent: agent
            }),
        });

        Object.defineProperty(this, 'metrics', {
            enumerable: true,
            value: new Metrics(),
        });

        Object.defineProperty(this, 'pathnameEntries', {
            value: [],
        });

        const regExPath = utils.pathnameBuilder(
            this.pathname,
            this.prefix,
            ':podiumPodletName',
            ':podiumProxyName',
            ':podiumProxyExtras*',
        );
        Object.defineProperty(this, 'pathnameParser', {
            value: pathRegex(regExPath, this.pathnameEntries),
        });

        this.proxy.on('error', error => {
            this.log.error(error);
        });

        this.proxy.on('proxyReq', (proxyReq, req, res) => {
            const end = this.metrics.timer({
                name: 'podium_proxy_request',
                description:
                    'Proxy requests through a layout to target determined by podlet manifest',
                /*
                TODO: we can not count like this due to not having res.locals
                when stuff is framework free
                meta: {
                    podlet: res.locals.podlet,
                    proxy: res.locals.proxy,
                },
                */
            });

            res.on('finish', () => {
                end();
            });
        });

        this.registry.on('set', (key, item) => {
            Object.keys(item.proxy).forEach(name => {
                const path = utils.pathnameBuilder(
                    this.pathname,
                    this.prefix,
                    key,
                    name,
                );
                this.log.debug(
                    `a proxy endpoint is mounted at pathname: ${path} pointing to: ${
                        item.proxy[name]
                    }`,
                );
            });
        });

        this.registry.on('dispose', key => {
            this.log.debug(`dispose proxy item on key "${key}"`);
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumProxy';
    }

    register(manifest = {}) {
        // Do a stringify to hande that a @podium/podlet instance is passed in.
        // joi.validate will parse it into an object again.
        const obj = JSON.parse(JSON.stringify(manifest));

        joi.attempt(
            obj,
            schemas.manifest.schema,
            new Error(
                'The value for the required argument "manifest" not defined or not valid.',
            ),
        );

        this.registry.set(obj.name, obj, Infinity);
    }

    process(req, res) {
        // TODO: replace with a instance check when there is one PodiumState
        // class used by multiple modules.
        let state;
        if (Object.prototype.toString.call(req) === '[object PodiumState]') {
            state = req;
        } else {
            state = new State(req, res);
        }

        // TODO: Only needed to support 2.x version of Layout.
        // Remove when layout is http framework free.
        state.context = utils.getFromLocalsPodium(res, 'context');

        return new Promise((resolve, reject) => {
            const match = this.pathnameParser.exec(state.url.pathname);

            if (match) {
                // Turn matched uri parameters into an object of parameters
                const params = {};
                for (let i = 1; i < match.length; i += 1) {
                    const key = this.pathnameEntries[i - 1];
                    params[key.name] = match[i];
                }

                // See if "podiumPodletName" matches a podlet in registry.
                // If so we might want to proxy. If not, skip rest of processing
                const manifest = this.registry.get(params.podiumPodletName);
                if (!manifest) {
                    resolve(state);
                    return;
                }

                // See if podlet has a matching proxy entry.
                // If so we want to proxy. If not, skip rest of processing
                let target = manifest.proxy[params.podiumProxyName];
                if (!target) {
                    resolve(state);
                    return;
                }

                // See if proxy entry is relative or not.
                // In a layout server it will never be relative since the
                // client will resolve relative paths in the manifest.
                // Iow: this will only hit in a podlet in development mode,
                // so we resolve back to the local host.
                if (utils.uriIsRelative(target)) {
                    target = utils.uriBuilder(
                        target,
                        `${state.url.protocol}//${state.url.hostname}${
                            state.url.port ? ':' : ''
                        }${state.url.port}`,
                    );
                }

                // Append extra paths from the original URL to the proxy
                // target pathname
                if (params.podiumProxyExtras) {
                    target = utils.uriBuilder(params.podiumProxyExtras, target);
                }

                // Append query params from the original URL to the proxy
                // target pathname
                if (state.url.search) {
                    target += `${state.url.search}`;
                }

                // Append context
                utils.serializeContext(
                    state.request.headers,
                    state.context,
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

                state.response.on('finish', () => {
                    resolve();
                });

                this.proxy.web(state.request, state.response, config, error => {
                    reject(error);
                });

                return;
            }
            resolve(state);
        });
    }

    middleware() {
        return (req, res, next) => {
            this.process(req, res)
                .then(state => {
                    if (state) {
                        next();
                    }
                })
                .catch(error => {
                    next(error);
                });
        };
    }

    dump() {
        return this.registry.dump();
    }

    load(dump) {
        return this.registry.load(dump);
    }
};

module.exports = PodiumProxy;
