'use strict';

const ResourceProxy = require('./resource-proxy');
const { Router } = require('express');
const abslog = require('abslog');
const utils = require('@podium/utils');

module.exports = class ManifestResources {
    constructor(name, client, config, options = {}) {
        this.logger = abslog(options.logger);
        this.resourceMountPath = '/podium-resource';
        this.client = client;
        this.proxy = new ResourceProxy(name, config, this.logger);
    }

    middleware() {
        const resourceMountPathRexExp = new RegExp(
            `^${this.resourceMountPath}`,
        );

        const router = Router();

        router.all(
            `${this.resourceMountPath}/:podletName/*`,
            (req, res, next) => {
                if (!res.locals.podium.context) {
                    throw new ReferenceError(
                        'Podium context is not set for request. Please add `@podium/context`.',
                    );
                }

                const podletName = req.params.podletName;
                const resource = this.client[podletName];

                if (resource) {
                    const uri = utils.uriBuilder('/public', resource.uri);
                    this.logger.debug(
                        `Proxing ${req.method} ${req.url} to fragment at ${
                            uri
                        }`,
                    );
                    this.proxy.request(uri, req, res);
                } else {
                    this.logger.warn(`${podletName} is not a known podlet resource`);
                    next();
                }
            },
        );

        return [router];
    }
};
