'use strict';

const { pipeServiceFactory } = require('@finn-no/proxy-services');
const { toPodiumRequest } = require('@podium/context');

const http = require('http');
const https = require('https');

if (process.env.NODE_ENV === 'production') {
    http.globalAgent.keepAlive = true;
    https.globalAgent.keepAlive = true;
    http.globalAgent.options.keepAlive = true;
    https.globalAgent.options.keepAlive = true;
}

const requireArg = name => {
    throw new Error(`Please provide a ${name}`);
};

function getQuery(query, whitelist) {
    return Array.isArray(whitelist)
        ? whitelist.filter(k => query[k]).reduce((v, k) => {
              v[k] = query[k];
              return v;
          }, {})
        : {};
}

module.exports = class ResourceProxy {
    constructor({
        serverId = requireArg('serverId string'),
        client = requireArg('client instance'),
        logger = requireArg('logger'),
        pipeConfig,
    }) {
        this.serverId = serverId;
        this.client = client;
        this.client.on('manifest new', ({ id }) => {
            this.id = id;
        });
        this.logger = logger;
        // TODO: How to inject the config?
        this.pipeService = pipeServiceFactory(pipeConfig);
    }

    hasManifest() {
        return !!this.client.getMostRecentManifest();
    }

    hasProxyRoute(path) {
        // fixme: this should also respect METHOD?
        const manifest = this.client.getMostRecentManifest();
        if (
            !manifest ||
            !manifest.resources ||
            manifest.resources.length === 0
        ) {
            return false;
        }
        return manifest.resources.some(e => e.path === path);
    }

    getFirstMatchingResource(path) {
        const manifest = this.client.getMostRecentManifest();
        return manifest.resources.find(e => e.path === path);
    }

    resolveUri(path) {
        // fixme concat url more safely
        return `${this.client.uri}${path}`;
    }

    getHeaders(req) {
        return Object.assign(
            { 'podium-server-id': this.serverId },
            // TODO should the raw already parsed headers be appended to req?
            toPodiumRequest(req.podiumContext).headers
        );
    }

    request(path, req, res, next) {
        const entry = this.getFirstMatchingResource(path);

        if (!entry) {
            return next();
        }

        const uri = this.resolveUri(entry.path);

        this.pipeService({
            req,
            res,
            uri,
            ignoreClientDisconnects: true,
            // fixme should we pass req.query to target in DEV?
            query: getQuery(req.query, entry.params),
            headers: this.getHeaders(req),
            method: req.method,
        });

        // fixme: should we validate payload size?
    }
};
