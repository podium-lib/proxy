'use strict';

const originalUrl = require('original-url');
const pathRegex = require('path-to-regexp');
const schemas = require('@podium/schemas');
const { URL } = require('url');
const putils = require('@podium/utils');
const abslog = require('abslog');
const Cache = require('ttl-mem-cache');
const Proxy = require('http-proxy');
const http = require('http');
const joi = require('joi');

const _stripFragment = Symbol('_stripFragment');
const _padFragment = Symbol('_padFragment');

const HTTP_AGENT = new http.Agent({
    keepAlive: true,
    maxSockets: 10,
    maxFreeSockets: 10,
    timeout: 60000,
    keepAliveMsecs: 30000,
});

class PodiumProxy {
    constructor({ pathname = '/', prefix = 'podium-resource', timeout = 20000, maxAge = Infinity, agent = HTTP_AGENT, logger = null } = {}) {
        Object.defineProperty(this, 'pathname', {
            value: this[_padFragment](pathname),
        });

        Object.defineProperty(this, 'prefix', {
            value: this[_stripFragment](prefix),
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
                `${this.pathname}${this.prefix}/:podiumPodletName/:podiumProxyName/:podiumProxyExtras*`,
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

    [_padFragment](fragment) {
        if (!fragment.startsWith('/')) {
            fragment = `/${fragment}`;
        }

        if (!fragment.endsWith('/')) {
            fragment = `${fragment}/`;
        }

        return fragment;
    }

    [_stripFragment](fragment) {
        if (fragment.startsWith('/')) {
            fragment = fragment.substr(1);
        }

        if (fragment.endsWith('/')) {
            fragment = fragment.substr(0, fragment.length - 1);
        }

        return fragment;
    }

    register(manifest = {}) {
        // Do a stringify to hande that a @podium/podlet instance is passed in.
        // joi.validate will parse it into an object again.
        const obj = JSON.stringify(manifest);

        const validatedManifest = joi.validate(obj, schemas.manifest.schema);

        if (validatedManifest.error) {
            throw validatedManifest.error;
        }

        // TODO: Infinity here is a workaround for global Intinity in the cache not working
        this.registry.set(
            validatedManifest.value.name,
            validatedManifest.value,
            Infinity
        );
    }

    middleware() {
        return (req, res, next) => {
            const url = originalUrl(req);
            const match = this.pathnameParser.exec(url.pathname);

            if (match) {
                const params = {};
                for (let i = 1; i < match.length; i++) {
                    const key = this.pathnameEntries[i - 1];
                    params[key.name] = match[i];
                }

                const manifest = this.registry.get(params.podiumPodletName);
                if (!manifest) {
                    next();
                    return;
                }

                let target = manifest.proxy[params.podiumProxyName];
                if (!target || putils.uriIsRelative(target)) {
                    next();
                    return;
                }

                if (params.podiumProxyExtras) {
                    target += `/${params.podiumProxyExtras}`;
                }

                if (url.search) {
                    target += `${url.search}`;
                }

                // TODO: if res.locals.podium.context is not pressent, this will fail. Harden!!
                putils.serializeContext(
                    req.headers,
                    res.locals.podium.context,
                    params.podiumPodletName
                );

                const parsed = new URL(target);

                const config = {
                    changeOrigin: false,
                    autoRewrite: true,
                    ignorePath: true,
                    secure: false,
                    headers: {
                        host: parsed.host
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
}

module.exports = PodiumProxy;
