'use strict';

const { pathToRegexp } = require('path-to-regexp');
const { validate } = require('@podium/schemas');
const Metrics = require('@metrics/client');
const { URL } = require('url');
const abslog = require('abslog');
const utils = require('@podium/utils');
const Cache = require('ttl-mem-cache');
const Proxy = require('http-proxy');

const PodiumProxy = class PodiumProxy {
    constructor({
        pathname = '/',
        prefix = '/podium-resource',
        timeout = 20000,
        maxAge = Infinity,
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

        this.registry.on('error', (error) => {
            this.log.error(
                'Error emitted by the registry in @podium/proxy module',
                error,
            );
        });

        Object.defineProperty(this, 'proxy', {
            // eslint-disable-next-line new-cap
            value: new Proxy.createProxy({
                proxyTimeout: timeout,
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
            value: pathToRegexp(regExPath, this.pathnameEntries),
        });

        this.metrics.on('error', (error) => {
            this.log.error(
                'Error emitted by metric stream in @podium/proxy module',
                error,
            );
        });

        this.proxy.on('error', (error) => {
            this.log.error(
                'Error emitted by proxy in @podium/proxy module',
                error,
            );
        });

        this.registry.on('set', (key, item) => {
            Object.keys(item.proxy).forEach((name) => {
                const path = utils.pathnameBuilder(
                    this.pathname,
                    this.prefix,
                    key,
                    name,
                );
                this.log.debug(
                    `a proxy endpoint is mounted at pathname: ${path} pointing to: ${item.proxy[name]}`,
                );
            });
        });

        this.registry.on('dispose', (key) => {
            this.log.debug(`dispose proxy item on key "${key}"`);
        });

        this.histogram = this.metrics.histogram({
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

    get [Symbol.toStringTag]() {
        return 'PodiumProxy';
    }

    register(manifest = {}) {
        // Do a stringify to hande that a @podium/podlet instance is passed in.
        const obj = JSON.parse(JSON.stringify(manifest));

        if (validate.manifest(obj).error)
            throw new Error(
                'The value for the required argument "manifest" is not defined or not valid.',
            );

        this.registry.set(obj.name, obj, Infinity);
    }

    process(incoming) {
        if (
            Object.prototype.toString.call(incoming) !==
            '[object PodiumHttpIncoming]'
        ) {
            throw TypeError('Argument must be of type "PodiumHttpIncoming"');
        }

        const endTimer = this.histogram.timer({
            labels: {
                name: incoming.name,
            },
        });

        return new Promise((resolve, reject) => {
            const match = this.pathnameParser.exec(incoming.url.pathname);
            let errored = false;

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
                    endTimer({ labels: { podlet: params.podiumPodletName } });
                    resolve(incoming);
                    return;
                }

                // See if podlet has a matching proxy entry.
                // If so we want to proxy. If not, skip rest of processing
                let target = manifest.proxy[params.podiumProxyName];
                if (!target) {
                    endTimer({ labels: { podlet: params.podiumPodletName } });
                    resolve(incoming);
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

                    // eslint-disable-next-line no-param-reassign
                    incoming.proxy = true;
                    endTimer({
                        labels: {
                            podlet: params.podiumPodletName,
                            proxy: true,
                        },
                    });
                    resolve(incoming);
                });

                this.proxy.web(
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

    dump() {
        return this.registry.dump();
    }

    load(dump) {
        return this.registry.load(dump);
    }
};

module.exports = PodiumProxy;
