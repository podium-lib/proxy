'use strict';

const { pipeServiceFactory } = require('./proxy-services');
const { toPodiumRequest } = require('@podium/context');

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
    constructor(config) {
        this.serverId = config.appName;
        this.pipeService = pipeServiceFactory(config);
    }

    getHeaders(req) {
        return Object.assign(
            { 'podium-server-id': this.serverId },
            // TODO should the raw already parsed headers be appended to req?
            toPodiumRequest(req.podiumContext).headers,
        );
    }

    request(resourceUri, path, req, res) {
        // fixme concat url more safely
        const uri = resourceUri + path;

        return this.pipeService({
            req,
            res,
            timeout: 60 * 1000,
            uri,
            ignoreClientDisconnects: true,
            query: req.query,
            headers: this.getHeaders(req),
            method: req.method,
        });

        // fixme: should we validate payload size?
    }
};
