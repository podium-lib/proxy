'use strict';

const test = require('ava');
const ResourceProxy = require('../lib/resource-proxy.js');

test('should throw on missing args', t => {
    t.throws(() => {
        new ResourceProxy(); // eslint-disable-line
    });
    t.throws(() => {
        new ResourceProxy({ serverId: 'server-id'}); // eslint-disable-line
    });
    t.throws(() => {
        new ResourceProxy({ client: { id: 'podlet-id' } }); // eslint-disable-line
    });
});


test('hasProxyRoute should return true if match', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy({
        serverId: 'server-id',
        client: {
            id: 'podlet-id',
            getMostRecentManifest () {
                return {
                    resources: [{ path }],
                };
            },
        },
    });

    t.true(proxy.hasProxyRoute(path));
});
test('hasProxyRoute should return false if if no match', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy({
        serverId: 'server-id',
        client: {
            id: 'podlet-id',
            getMostRecentManifest () {
                return {
                    resources: [{ path: 'other/path' }, { path: 'and/no/soup' }],
                };
            },
        },
    });

    t.false(proxy.hasProxyRoute(path));
});

test('hasProxyRoute should return false if if no manifest', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy({
        serverId: 'server-id',
        client: {
            id: 'podlet-id',
            getMostRecentManifest () {
                return null;
            },
        },
    });

    t.false(proxy.hasProxyRoute(path));
});


test('hasProxyRoute should return false if if no manifest resources', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy({
        serverId: 'server-id',
        client: {
            id: 'podlet-id',
            getMostRecentManifest () {
                return {
                    resources: [],
                };
            },
        },
    });

    t.false(proxy.hasProxyRoute(path));
});


test('getFirstMatchingResource should select first matching resource path', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const resource = { path };
    const proxy = new ResourceProxy({
        serverId: 'server-id',
        client: {
            id: 'podlet-id',
            getMostRecentManifest () {
                return {
                    resources: [{ path: 'asdf' }, resource, { path }, { path: 'asdf' }],
                };
            },
        },
    });

    t.true(proxy.hasProxyRoute(path));
    t.true(proxy.getFirstMatchingResource(path) === resource);
});
