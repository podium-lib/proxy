'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const fiaasLogger = require('@finn-no/fiaas-logger');

const ResourceProxy = require('./resource-proxy.js');

const requireArg = (name) => {
    throw new Error(`Please provide a ${name}`);
};

module.exports = class PodletResources extends EventEmitter {
    constructor ({ serverId = requireArg('serverId string'), clients = requireArg('clients array'), logger = fiaasLogger }) {
        super();
        this.serverId = serverId;
        this.podlets = clients.map(client => new ResourceProxy({ serverId, client }));
        this.logger = logger;
    }

    middleware () {
        const router = Router();

        router.all('/podium/:podletId/*', (req, res, next) => {
            const { podletId } = req.params;
            const proxy = this.podlets.find(c => c.id === podletId);

            if (!proxy || !proxy.hasManifest()) {
                return next();
            }

            if (!proxy.hasProxyRoute(req.path)) {
                this.logger.debug(`${req.path} did not match a podlet resource`);
                return next();
            }

            this.logger.debug(`Proxing ${req.method} ${req.path} to podlet ${podletId}`);
            proxy.request(req, res, next);
        });

        return router;
    }
};
