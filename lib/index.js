'use strict';

const { EventEmitter } = require('events');

const { Router } = require('express');
const logger = require('@finn-no/fiaas-logger');

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
        const router = Router();

        const resourceMountPathRexExp = new RegExp(
            `^${this.resourceMountPath}`
        );

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

        return router;
    }
};
