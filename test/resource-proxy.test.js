'use strict';

const configLoader = require('@finn-no/config-loader');
const test = require('ava');
const ResourceProxy = require('../lib/resource-proxy.js');
const configDefs = require('../config');

function getConfig(env = {}) {
    return configLoader({
        paths: [],
        extraDefinitions: configDefs,
        env: Object.assign({ APP_NAME: 'server-id' }, env),
    });
}

test('should throw on missing args', t => {
    /* eslint-disable no-new */
    t.throws(() => {
        new ResourceProxy();
    });
    t.throws(() => {
        new ResourceProxy(undefined, { serverId: 'server-id' });
    });
    t.throws(() => {
        new ResourceProxy({
            client: {
                on: (eventName, cb) => cb({ id: 'podlet-id' }),
                id: 'podlet-id',
            },
        });
    });
    /* eslint-enable */
});

test('hasProxyRoute should return true if match', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy(
        {
            on: (eventName, cb) => cb({ id: 'podlet-id' }),
            getMostRecentManifest() {
                return {
                    resources: [{ path }],
                };
            },
        },
        getConfig()
    );

    t.true(proxy.hasProxyRoute(path));
});
test('hasProxyRoute should return false if if no match', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy(
        {
            on: (eventName, cb) => cb({ id: 'podlet-id' }),
            getMostRecentManifest() {
                return {
                    resources: [
                        { path: 'other/path' },
                        { path: 'and/no/soup' },
                    ],
                };
            },
        },
        getConfig()
    );

    t.false(proxy.hasProxyRoute(path));
});

test('hasProxyRoute should return false if if no manifest', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy(
        {
            on: (eventName, cb) => cb({ id: 'podlet-id' }),
            getMostRecentManifest() {
                return null;
            },
        },
        getConfig()
    );

    t.false(proxy.hasProxyRoute(path));
});

test('hasProxyRoute should return false if if no manifest resources', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const proxy = new ResourceProxy(
        {
            on: (eventName, cb) => cb({ id: 'podlet-id' }),
            getMostRecentManifest() {
                return {
                    resources: [],
                };
            },
        },
        getConfig()
    );

    t.false(proxy.hasProxyRoute(path));
});

test('getFirstMatchingResource should select first matching resource path', t => {
    const path = `/some/path${Math.round(Math.random() * 1000)}`;
    const resource = { path };
    const proxy = new ResourceProxy(
        {
            on: (eventName, cb) => cb({ id: 'podlet-id' }),
            getMostRecentManifest() {
                return {
                    resources: [
                        { path: 'asdf' },
                        resource,
                        { path },
                        { path: 'asdf' },
                    ],
                };
            },
        },
        getConfig()
    );

    t.true(proxy.hasProxyRoute(path));
    t.true(proxy.getFirstMatchingResource(path) === resource);
});
