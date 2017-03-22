'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const fiaasLogger = require('@finn-no/fiaas-logger');

const ResourceProxy = require('./resource-proxy.js');

const requireArg = (name) => {
    throw new Error(`Please provide a ${name}`);
};

module.exports = class ManifestResources extends EventEmitter {
    constructor ({
        serverId = requireArg('serverId string'),
        clients = requireArg('clients array'),
        logger = fiaasLogger,
    }) {
        super();
        this.serverId = serverId;
        this.clients = clients.map(client => new ResourceProxy({ serverId, client }));
        this.logger = logger;
    }

    middleware () {
        const router = Router();

        router.all('/podium/:fragmentId/*', (req, res, next) => {
            const { fragmentId } = req.params;
            const proxy = this.clients.find(c => c.id === fragmentId);

            if (!proxy || !proxy.hasManifest()) {
                return next();
            }

            if (!proxy.hasProxyRoute(req.path)) {
                this.logger.debug(`${req.path} did not match a fragment manifest resource`);
                return next();
            }

            this.logger.debug(`Proxing ${req.method} ${req.path} to fragment ${fragmentId}`);
            proxy.request(req, res, next);
        });

        return router;
    }
};
