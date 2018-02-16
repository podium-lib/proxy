'use strict';

const configLoader = require('@finn-no/config-loader');
const express = require('express');
const PodletClient = require('@podium/podlet-client');
const Context = require('@podium/context');
const supertest = require('supertest');
const configDefs = require('../config');


const mockProxyImplementation = jest.fn();

jest.mock('../lib/resource-proxy', () => {
    const ResourceProxy = jest.requireActual('../lib/resource-proxy');

    return class MockResourceProxy extends ResourceProxy {
        request(resourceUri, req, res) {
            mockProxyImplementation(resourceUri);

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

    const context = new Context('someApp');
    app.use(context.middleware());

    const config = getConfig({ APP_NAME: 'supah-server-2' });
    const resourceProxy = new ResourceProxy('someApp', client, config);
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
        'http://test-crash-idiots/public/some/path',
    );
});

test('should not proxy calls for unknown podlets', async () => {
    const app = express();
    const id = 'test-crash-idiots';

    const client = new PodletClient();
    client.register({ uri: `http://${id}`, name: 'resource' });

    const context = new Context('someApp');
    app.use(context.middleware());

    const config = getConfig({ APP_NAME: 'supah-server-2' });
    const resourceProxy = new ResourceProxy('someApp', client, config);
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    // request the resource
    await supertest(app).get('/podium-resource/something-weird/some/path');

    expect(errors).toHaveLength(0);
    expect(mockProxyImplementation).not.toHaveBeenCalledWith(
        'http://test-crash-idiots/public/something-weird/some/path',
    );
});
