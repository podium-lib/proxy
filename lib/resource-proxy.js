'use strict';

const request = require('request');

const requireArg = (name) => {
    throw new Error(`Please provide a ${name}`);
};

function getQuery (query, whitelist) {
    return Array.isArray(whitelist) ? whitelist
        .filter(k => query[k])
        .reduce((v, k) => {
            v[k] = query[k];
            return v;
        }, {}) : {};
}


// fix? should the resourcePRoxy wrap with circuitbreaker?
module.exports = class ResourceProxy {
    constructor ({
        serverId = requireArg('serverId string'),
        client = requireArg('client instance'),
    }) {
        this.serverId = serverId;
        this.client = client;
        this.id = client.id;
    }

    hasManifest () {
        return !!this.client.getMostRecentManifest();
    }

    hasProxyRoute (path) {
        const manifest = this.client.getMostRecentManifest();
        if (!manifest || !manifest.resources || manifest.resources.length === 0) {
            return false;
        }
        return manifest.resources.some(e => e.path === path);
    }

    getFirstMatchingResource (path) {
        const manifest = this.client.getMostRecentManifest();
        return manifest.resources.find(e => e.path === path);
    }

    resolveUri (path) {
        // fixme concat url more safely
        return `${this.client.uri}${path}`;
    }

    getHeaders (req) {
        return {
            'podium-server-id': this.serverId,
            // fixme userId and deviceType should be provided async via promise?
            'podium-user-id': req.userId,
            'poidum-device-type': req.deviceType,
        };
    }

    request (req, res, next) {
        const entry = this.getFirstMatchingResource(req.path);

        const target = request({
            url: this.resolveUri(entry.path),
            // fixme should we pass req.query to target in DEV?
            qs: getQuery(req.query, entry.params),
            headers: this.getHeaders(req),
            method: req.method,
        });

        target.pipe(res).on('error', next);

        // fixme: should we validate payload size?
        req.on('data', (data) => {
            target.write(data);
        });
    }
};
