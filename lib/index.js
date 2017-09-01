'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const fiaasLogger = require('@finn-no/fiaas-logger');

const ResourceProxy = require('./resource-proxy.js');
const {} = require('@podium/context');

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
        // TODO: How to cleanly thread through this?
        pipeConfig,
    }) {
        super();
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

    middleware({ resourceMountPath = '/podium-resource' }) {
        const router = Router();

        router.all(`${resourceMountPath}/*`, (req, res, next) => {
            const proxy = getProxyForPath(this.clients, req.path, req.method);
            if (proxy) {
                this.logger.debug(
                    `Proxing ${req.method} ${req.url} to fragment at ${proxy
                        .client.uri}`
                );
                proxy.request(req, res, next);
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
