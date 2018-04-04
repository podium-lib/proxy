'use strict';

// const Metrics = require('@podium/metrics');
const pathRegex = require('path-to-regexp');
const schemas = require('@podium/schemas');
const putils = require('@podium/utils');
const abslog = require('abslog');
const Cache = require('ttl-mem-cache');
const Proxy = require('http-proxy');
const http = require('http');
const joi = require('joi');

const HTTP_AGENT = new http.Agent({
    keepAlive: true,
    maxSockets: 10,
    maxFreeSockets: 10,
    timeout: 60000,
    keepAliveMsecs: 30000,
});

const TIMEOUT = 1000; // 1 second

const MAX_AGE = Infinity;

class PodiumProxy {
    constructor(options = {}) {
        Object.defineProperty(this, 'options', {
            value: Object.assign(
                {
                    timeout: TIMEOUT,
                    maxAge: MAX_AGE,
                    agent: HTTP_AGENT,
                },
                options
            ),
        });

        this.log = abslog(options.logger);

        Object.defineProperty(this, 'registry', {
            value: new Cache({
                ttl: options.maxAge,
            }),
        });

        Object.defineProperty(this, 'proxy', {
            value: new Proxy.createProxy({
                proxyTimeout: this.options.timeout,
                agent: this.options.agent,
            }),
        });

        /*
        Object.defineProperty(this, 'metrics', {
            enumerable: true,
            value: new Metrics(),
        });
*/

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
        const validatedManifest = joi.validate(
            manifest,
            schemas.manifest.schema
        );
        if (validatedManifest.error) {
            throw validatedManifest.error;
        }

        // Infinity here is a workaround for global Intinity in the cache not working
        this.registry.set(
            validatedManifest.value.name,
            validatedManifest.value,
            Infinity
        );
    }

    middleware(path = '/') {
        const keys = [];
        const parser = pathRegex(
            `${path}/:podiumPodletName/:podiumProxyName/:podiumProxyExtras*`,
            keys
        );

        return (req, res, next) => {
            const match = parser.exec(req.url);

            if (match) {
                const params = {};
                for (let i = 1; i < match.length; i++) {
                    const key = keys[i - 1];
                    params[key.name] = match[i];
                }

                const manifest = this.registry.get(params.podiumPodletName);
                let target = manifest.proxy[params.podiumProxyName];

                if (!target) {
                    next();
                    return;
                }

                if (params.podiumProxyExtras) {
                    target += `/${params.podiumProxyExtras}`;
                }

                putils.serializeContext(
                    req.headers,
                    res.locals.podium.context,
                    params.podiumPodletName
                );

                const config = {
                    changeOrigin: false,
                    autoRewrite: true,
                    ignorePath: true,
                    secure: false,
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
