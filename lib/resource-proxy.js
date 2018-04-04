'use strict';

const { pipeServiceFactory } = require('./proxy-services');
const Context = require('@podium/context');

const http = require('http');
const https = require('https');

// TODO: Does not belong here
if (process.env.NODE_ENV === 'production') {
    http.globalAgent.keepAlive = true;
    https.globalAgent.keepAlive = true;
    http.globalAgent.options.keepAlive = true;
    https.globalAgent.options.keepAlive = true;
}

module.exports = class ResourceProxy {
    constructor(name, config, logger) {
        this.pipeService = pipeServiceFactory(name, config, {}, logger);
    }

    getHeaders(req, res) {
        return Context.serialize(
            {},
            res.locals.podium.context,
            req.params.podletName
        );
    }

    request(uri, req, res) {
        return this.pipeService({
            req,
            res,
            timeout: 60 * 1000,
            uri,
            ignoreClientDisconnects: true,
            query: req.query,
            headers: this.getHeaders(req, res),
            method: req.method,
        });
    }
};
