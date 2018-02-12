'use strict';

const { EventEmitter } = require('events');
const ResourceProxy = require('./resource-proxy');
const { Router } = require('express');
const abslog = require('abslog');

const requireArg = name => {
    throw new Error(`Please provide a ${name}`);
};

module.exports = class ManifestResources extends EventEmitter {
    constructor(client = requireArg('client object'), config, logger) {
        super();
        this.logger = abslog(logger);
        this.resourceMountPath = config.resourceMountPath;
        this.client = client;
        this.proxy = new ResourceProxy(config, this.logger);
    }

    middleware() {
        const resourceMountPathRexExp = new RegExp(
            `^${this.resourceMountPath}`,
        );

        const router = Router();

        router.all(
            `${this.resourceMountPath}/:podletName/*`,
            (req, res, next) => {
                if (!req.podiumContext) {
                    throw new ReferenceError(
                        'Podium context is not set for request. Please add `@podium/context`.',
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

                    this.logger.debug(
                        `Proxing ${req.method} ${req.url} to fragment at ${
                            resource.uri
                        }`,
                    );

                    this.proxy.request(resource.uri, path, req, res);
                } else {
                    this.logger.warn(`${podletName} is not a known podlet resource`);
                    next();
                }
            },
        );

        return [router];
    }
};
