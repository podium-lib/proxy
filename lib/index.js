'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const logger = require('@finn-no/fiaas-logger');
const expressProxy = require('http-proxy-middleware');

const ResourceProxy = require('./resource-proxy');

const requireArg = name => {
    throw new Error(`Please provide a ${name}`);
};

module.exports = class ManifestResources extends EventEmitter {
    constructor(client = requireArg('client object'), config) {
        super();
        this.resourceMountPath = config.resourceMountPath;
        this.client = client;
        this.proxy = new ResourceProxy(config);
    }

    middleware() {
        const resourceMountPathRexExp = new RegExp(
            `^${this.resourceMountPath}`
        );

        const proxy = expressProxy(
            (pathname, req) => {
                const activatedInUnleash =
                    req.unleash && req.unleash['podium.useExpressProxy'];

                return activatedInUnleash && pathname.includes('last-searches');
            },
            {
                logProvider: () => logger('proxy-thingy'),
                target: 'http://podlet-server',
                onProxyReq: (proxyReq, req) => {
                    Object.entries(
                        this.proxy.getHeaders(req)
                    ).forEach(([header, headerValue]) => {
                        proxyReq.setHeader(header, headerValue);
                    });
                },
                pathRewrite(path) {
                    return path
                        .replace(resourceMountPathRexExp, '')
                        .replace('/last-searches', '/public');
                },
                router() {
                    return 'http://podlet-server';
                },
            }
        );

        const router = Router();

        router.all(
            `${this.resourceMountPath}/:podletName/*`,
            (req, res, next) => {
                if (!req.podiumContext) {
                    throw new ReferenceError(
                        'Podium context is not set for request. Please add `@podium/context`.'
                    );
                }

                const podletName = req.params.podletName;

                const resource = this.client[podletName];

                if (resource) {
                    // This `new RegExp` is safe as we know that the client has a podlet with this name,
                    // and the client verifies the name against a basic regexp
                    const podletNameRegexp = new RegExp(`^/${podletName}`);
                    const path = req.path
                        .replace(resourceMountPathRexExp, '')
                        .replace(podletNameRegexp, '/public');

                    logger.debug(
                        `Proxing ${req.method} ${req.url} to fragment at ${resource.uri}`
                    );

                    this.proxy.request(resource.uri, path, req, res);
                } else {
                    logger.warn(`${podletName} is not a known podlet resource`);
                    next();
                }
            }
        );

        return [proxy, router];
    }
};
