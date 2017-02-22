'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');

const ResourceProxy = require('./resource-proxy.js');

const requireArg = (name) => {
    throw new Error(`Please provide a ${name}`);
};

module.exports = class PodletResources extends EventEmitter {
    constructor ({ serverId = requireArg('serverId string'), clients = requireArg('clients array'), logger = console }) {
        super();
        this.serverId = serverId;
        this.podlets = clients.map(client => new ResourceProxy({ serverId, client }));
        this.logger = logger;
    }

    middleware () {
        const router = Router();

        router.all('/podlet/:podletId/*', (req, res, next) => {
            const { podletId } = req.params;
            const proxy = this.podlets.find(c => c.id === podletId);
            if (!proxy) {
                return next();
            }
            if (!proxy.hasManifest()) {
                return next(new Error(`Cannot find manifest for ${podletId}`));
            }
            if (!proxy.hasProxyRoute(req.path)) {
                return next();
            }
            proxy.request(req, res, next);
        });

        return router;
    }
};
