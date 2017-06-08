'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const fiaasLogger = require('@finn-no/fiaas-logger');

const ResourceProxy = require('./resource-proxy.js');

const requireArg = (name) => {
    throw new Error(`Please provide a ${name}`);
};

function getProxyForPath (proxies, path) {
    return proxies.find(proxy => proxy.hasProxyRoute(path));
}

module.exports = class ManifestResources extends EventEmitter {
    constructor ({
        serverId = requireArg('serverId string'),
        clients = requireArg('clients array'),
        logger = fiaasLogger,
    }) {
        super();
        this.serverId = serverId;
        this.clients = clients.map(client => new ResourceProxy({
            serverId,
            client,
            logger,
        }));
        this.logger = logger;
    }

    middleware () {
        const router = Router();

        router.all('/podium-resource/*', (req, res, next) => {
            const proxy = getProxyForPath(this.clients, req.path, req.method);
            if (proxy) {
                this.logger.debug(`Proxing ${req.method} ${req.path} to fragment at ${proxy.client.uri}`);
                proxy.request(req, res, next);
            } else {
                this.logger.debug(`${req.path} did not match a fragment manifest resource`);
                next();
            }
        });

        return router;
    }
};
