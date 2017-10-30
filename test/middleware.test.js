'use strict';

const configLoader = require('@finn-no/config-loader');
const express = require('express');
const PodletClient = require('@podium/podlet-client');
const { browserMiddleware } = require('@podium/context');
const supertest = require('supertest');
const nock = require('nock');
const configDefs = require('../config');

const mockProxyImplementation = jest.fn();

jest.mock('../lib/resource-proxy', () => {
    const ResourceProxy = jest.requireActual('../lib/resource-proxy');

    return class MockResourceProxy extends ResourceProxy {
        request(resourceUri, path, req, res) {
            mockProxyImplementation(resourceUri, path);

            res.end();
        }
    };
});

const ResourceProxy = require('../lib/index');

function getConfig(env = {}) {
    return configLoader({
        paths: [],
        extraDefinitions: configDefs,
        env,
    });
}

test('should replace resource mount path and podlet name with /public', async () => {
    const app = express();
    const id = 'test-crash-idiots';

    const client = new PodletClient();
    client.register({ uri: `http://${id}`, name: 'resource' });

    const config = getConfig({ APP_NAME: 'supah-server-2' });
    const resourceProxy = new ResourceProxy(client, config);

    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    // request the resource
    await supertest(app).get('/podium-resource/resource/some/path');

    expect(errors).toHaveLength(0);
    expect(mockProxyImplementation).toHaveBeenCalledTimes(1);
    expect(mockProxyImplementation).toHaveBeenCalledWith(
        'http://test-crash-idiots',
        '/public/some/path'
    );
});

test('should not proxy calls for unknown podlets', async () => {
    const app = express();
    const id = 'test-crash-idiots';

    const client = new PodletClient();
    client.register({ uri: `http://${id}`, name: 'resource' });

    const config = getConfig({ APP_NAME: 'supah-server-2' });
    const resourceProxy = new ResourceProxy(client, config);

    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    // request the resource
    await supertest(app).get('/podium-resource/something-weird/some/path');

    expect(errors).toHaveLength(0);
    expect(mockProxyImplementation).not.toHaveBeenCalled();
});

test('should not use custom proxy for last-searches', async () => {
    const scope = nock('http://podlet-server', {
        reqheaders: {
            host: 'podlet-server',
        },
    })
        .get('/user-searches/public/last-searches')
        .reply(200);

    const app = express();
    const id = 'test-crash-idiots';

    const client = new PodletClient();
    client.register({ uri: `http://${id}`, name: 'lastSearches' });

    const config = getConfig({ APP_NAME: 'supah-server-2' });
    const resourceProxy = new ResourceProxy(client, config);

    app.use((req, res, next) => {
        req.unleash = { 'podium.useExpressProxy': true };

        next();
    });
    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    // request the resource
    const res = await supertest(app).get(
        '/podium-resource/userSearches/last-searches'
    );

    expect(errors).toHaveLength(0);
    expect(res.status).toBe(200);
    expect(mockProxyImplementation).not.toHaveBeenCalled();
    expect(scope.isDone()).toBe(true);
});
