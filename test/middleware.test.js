'use strict';

const configLoader = require('@finn-no/config-loader');
const envalid = require('envalid');
const express = require('express');
const test = require('ava');
const ResourceProxy = require('../lib/index.js');
const { PodiumClient } = require('@podium/client');
const { browserMiddleware } = require('@podium/context');
const supertest = require('supertest');
const nock = require('nock');
const configDefs = require('../config');

function getConfig(env = {}) {
    return configLoader({
        paths: [],
        extraDefinitions: Object.assign(
            { APP_NAME: envalid.str() },
            configDefs
        ),
        env: Object.assign({}, env),
    });
}

test.afterEach(() => {
    nock.cleanAll();
});

function getManifest(id) {
    return {
        id,
        version: '0.0.0',
        hash: 'some-hash',
        data: {
            html: 'some html',
            assetId: `some-asset-id-1234-${Math.round(10000 * Math.random())}`,
        },
        metadata: {
            fallbacks: {
                default: {
                    html: 'some html fallback',
                },
            },
            maxAge: 60,
            resources: [
                {
                    path: `/some/path`,
                    method: 'GET',
                    params: ['super'],
                },
                {
                    path: `/some/other/path`,
                    method: 'POST',
                    params: [],
                },
            ],
        },
    };
}

test('should 404 if manifest missing', async t => {
    const app = express();
    const clients = [
        new PodiumClient({
            consumerName: 'tests',
            uri: 'http://test-crash-dummies',
            fallback: 'OFFLINE!',
        }),
    ];

    const config = getConfig({ APP_NAME: 'supah-server-1' });

    const resourceProxy = new ResourceProxy(clients, config);

    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    const notFound = [];
    app.use((req, res, next) => {
        notFound.push(req.url);
        next();
    });

    await supertest(app).get('/podium-resource/test-crash-dummies/some/path');

    t.true(errors.length === 0);
    t.true(notFound.length === 1);
    t.true(notFound[0] === '/podium-resource/test-crash-dummies/some/path');
});

test.serial('should serve GET routes from manifest', async t => {
    const app = express();
    const id = 'test-crash-idiots';
    const clients = [
        new PodiumClient({
            consumerName: 'tests',
            uri: `http://${id}`,
            fallback: 'OFFLINE!',
        }),
    ];

    const config = getConfig({ APP_NAME: 'supah-server-2' });
    const resourceProxy = new ResourceProxy(clients, config);

    // answer on a podlet resource url
    nock(clients[0].uri)
        .matchHeader('podium-server-id', 'supah-server-2')
        .get('/some/path')
        .reply(200, 'SUPPA ER OK');

    // answer with the podlet manifest
    nock(clients[0].uri).get('/').reply(200, getManifest(id));

    // trigger fetch of manifest / warm up
    await clients[0].fetch();

    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    // request the resource
    const result = await supertest(app).get(`/podium-resource/some/path`);

    t.true(errors.length === 0);
    const { error } = result;
    t.falsy(error, 'request for podlet resource should not fail');
    const text = result.res.text;
    t.true(text === 'SUPPA ER OK');
});

test.serial('should serve POST routes from manifest', async t => {
    const app = express();
    const id = 'test-crash-dummies-post';
    const clients = [
        new PodiumClient({
            consumerName: 'tests',
            uri: `http://${id}`,
            fallback: 'OFFLINE!',
        }),
    ];
    const config = getConfig({ APP_NAME: 'supah-server-3' });
    const resourceProxy = new ResourceProxy(clients, config);

    // answer with the podlet manifest
    nock(clients[0].uri).get('/').reply(200, getManifest(id));

    // trigger fetch of manifest / warm up
    await clients[0].fetch();

    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    t.true(errors.length === 0);

    nock(clients[0].uri)
        .matchHeader('podium-server-id', 'supah-server-3')
        .post('/some/other/path', 'ER SUPPA GREI?')
        .reply(200, 'SUPPA ER OK');

    // request the POST resource
    const result2 = await supertest(app)
        .post(`/podium-resource/some/other/path`)
        .type('form')
        .send('ER SUPPA GREI?');

    t.true(errors.length === 0);
    const text = result2.res.text;
    t.true(text === 'SUPPA ER OK');
});

test.serial('should serve GET with query routes from manifest', async t => {
    t.plan(4);
    const resourceMountPath = '/podium-resource-4';
    const id = 'test-crash-smarties';
    const app = express();
    const clients = [
        new PodiumClient({
            consumerName: 'tests',
            uri: `http://${id}`,
            fallback: 'OFFLINE!',
        }),
    ];
    const config = getConfig({
        APP_NAME: 'supah-server-4',
        RESOURCE_MOUNT_PATH: resourceMountPath,
    });
    const resourceProxy = new ResourceProxy(clients, config);

    // answer with the podlet manifest
    nock(clients[0].uri).get('/').reply(200, getManifest(id));

    // trigger fetch of manifest / warm up
    await clients[0].fetch();

    app.use(browserMiddleware(config));
    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    t.true(errors.length === 0);

    // Bug in nock, it matches if _no_ query: https://github.com/node-nock/nock/pull/829
    nock(clients[0].uri)
        .get('/some/path')
        .matchHeader('podium-server-id', 'supah-server-4')
        .query(query => {
            t.deepEqual(query, {
                super: '4',
            });

            return true;
        })
        .reply(200, 'SUPPA ER FULL AV FLUER');

    // request the query param resource
    const result3 = await supertest(app).get(
        `${resourceMountPath}/some/path?super=4&foo=bar`
    );

    t.is(errors.length, 0);
    const text = result3.res.text;
    t.is(text, 'SUPPA ER FULL AV FLUER');
});

test.todo('should proxy valid resource routes');
test.todo('should respect method as well as path for resources');
