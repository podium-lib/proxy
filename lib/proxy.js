'use strict';

const originalUrl = require('original-url');
const pathRegex = require('path-to-regexp');
const schemas = require('@podium/schemas');
const { URL } = require('url');
const abslog = require('abslog');
const utils = require('@podium/utils');
const Cache = require('ttl-mem-cache');
const Proxy = require('http-proxy');
// const http = require('http');
const joi = require('joi');

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
        prefix = 'podium-resource',
        timeout = 20000,
        maxAge = Infinity,
        // agent = HTTP_AGENT,
        logger = null,
    } = {}) {
        Object.defineProperty(this, 'pathname', {
            value: utils.pathnameBuilder(pathname),
        });

        Object.defineProperty(this, 'prefix', {
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

        Object.defineProperty(this, 'pathnameEntries', {
            value: [],
        });

        Object.defineProperty(this, 'pathnameParser', {
            value: pathRegex(
                `${this.pathname}${
                    this.prefix
                }/:podiumPodletName/:podiumProxyName/:podiumProxyExtras*`,
                this.pathnameEntries
            ),
        });

        this.proxy.on('error', error => {
            this.log.error(error);
        });

        this.proxy.on('proxyReq', () => {
            //            this.log.debug('proxy request started', req.path, req.method, req);
        });

        this.proxy.on('proxyRes', () => {
            //            this.log.debug('proxy request got response', res);
        });

        this.registry.on('set', (key, item) => {
            this.log.debug(`register proxy item on key "${key}"`, item);
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
                'The value for the required argument "manifest" not defined or not valid.'
            )
        );

        // TODO: Infinity here is a workaround for global Intinity in the cache not working
        this.registry.set(manifest.name, manifest, Infinity);
    }

    middleware() {
        return (req, res, next) => {
            const url = originalUrl(req);
            const match = this.pathnameParser.exec(url.pathname);

            if (match) {
                // Turn matched uri parameters into an object of parameters
                const params = {};
                for (let i = 1; i < match.length; i++) {
                    const key = this.pathnameEntries[i - 1];
                    params[key.name] = match[i];
                }

                // See if "podiumPodletName" matches a podlet in registry.
                // If so we might want to proxy. If not, skip rest of processing
                const manifest = this.registry.get(params.podiumPodletName);
                if (!manifest) {
                    next();
                    return;
                }

                // See if podlet has a matching proxy entry.
                // If so we want to proxy. If not, skip rest of processing
                let target = manifest.proxy[params.podiumProxyName];
                if (!target || utils.uriIsRelative(target)) {
                    next();
                    return;
                }

                // Append extra paths from the original URL to the proxy
                // target pathname
                if (params.podiumProxyExtras) {
                    target += utils.pathnameBuilder(params.podiumProxyExtras);
                }

                // Append query params from the original URL to the proxy
                // target pathname
                if (url.search) {
                    target += `${url.search}`;
                }

                // Append context
                const context = utils.getFromLocalsPodium(res, 'context');
                utils.serializeContext(
                    req.headers,
                    context,
                    params.podiumPodletName
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

                this.proxy.web(req, res, config, next);
                return;
            }
            next();
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
