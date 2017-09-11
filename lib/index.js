'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const fiaasLogger = require('@finn-no/fiaas-logger');

const ResourceProxy = require('./resource-proxy.js');

const requireArg = name => {
    throw new Error(`Please provide a ${name}`);
};

function getProxyForPath(proxies, path) {
    return proxies.find(proxy => proxy.hasProxyRoute(path));
}

module.exports = class ManifestResources extends EventEmitter {
    constructor({
        serverId = requireArg('serverId string'),
        clients = requireArg('clients array'),
        logger = fiaasLogger,
        resourceMountPath = '/podium-resource',
        // TODO: How to cleanly thread through this?
        pipeConfig,
    }) {
        super();
        this.resourceMountPath = resourceMountPath;
        this.serverId = serverId;
        this.clients = clients.map(
            client =>
                new ResourceProxy({
                    serverId,
                    client,
                    logger,
                    pipeConfig,
                })
        );
        this.logger = logger;
    }

    // TODO: Move the defaults
    middleware({} = {}) {
        const router = Router();

        const resourceMountPathRexExp = new RegExp(
            `^${this.resourceMountPath}`
        );

        router.all(`${this.resourceMountPath}/*`, (req, res, next) => {
            if (!req.podiumContext) {
                throw new ReferenceError(
                    'Podium context is not set for request. Please add `@podium/context`.'
                );
            }

            const path = req.path.replace(resourceMountPathRexExp, '');
            const proxy = getProxyForPath(this.clients, path, req.method);
            if (proxy) {
                this.logger.debug(
                    `Proxing ${req.method} ${req.url} to fragment at ${proxy
                        .client.uri}`
                );
                proxy.request(path, req, res, next);
            } else {
                this.logger.warn(
                    `${req.url} did not match a fragment manifest resource`
                );
                next();
            }
        });

        return router;
    }
};
