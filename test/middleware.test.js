'use strict';

const express = require('express');
const test = require('ava');
const ResourceProxy = require('../lib/index.js');
const { PodletClient } = require('../../podium-client');
const supertest = require('supertest');
const nock = require('nock');

test.afterEach(() => {
    nock.cleanAll();
});

function getManifest () {
    return {
        id: 'test-crash-dummies',
        version: '0.0.0',
        data: {
            html: 'some html',
            assetId: `some-asset-id-1234-${Math.round(10000 * Math.random())}`,
        },
        metadata: {
            fallback: {
                html: 'some html fallback',
            },
            maxAge: 60,
            resources: [
                {
                    path: '/podlet/test-crash-dummies/some/path',
                    method: 'GET',
                    params: ['super'],
                },
                {
                    path: '/podlet/test-crash-dummies/some/other/path',
                    method: 'POST',
                    params: [],
                },
            ],
        },
    };
}

test('should next(error) if manifest missing', async t => {
    const app = express();
    const clients = [
        new PodletClient('test-crash-dummies', {
            fallback: 'OFFLINE!',
        }),
    ];
    const resourceProxy = new ResourceProxy({
        serverId: 'supah-server-1',
        clients,
    });

    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    t.true(errors.length === 0);

    await supertest(app)
        .get('/podlet/test-crash-dummies/some/path');

    t.true(errors.length === 1);
    t.regex(errors[0].message, /Cannot find manifest for test-crash-dummies/i);
});

test.serial('should serve GET routes from manifest', async t => {
    const app = express();
    const clients = [
        new PodletClient('test-crash-dummies', {
            fallback: 'OFFLINE!',
        }),
    ];
    const resourceProxy = new ResourceProxy({
        serverId: 'supah-server-2',
        clients,
    });

    // answer on a podlet resource url
    nock(clients[0].uri)
        .matchHeader('podium-server-id', 'supah-server-2')
        .get('/podlet/test-crash-dummies/some/path')
        .reply(200, 'SUPPA ER OK');

    // answer with the podlet manifest
    nock(clients[0].uri)
        .get('/')
        .reply(200, getManifest());

    // trigger fetch of manifest / warm up
    await clients[0].fetch();

    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    t.true(errors.length === 0);

    // answer on a podlet resource url
    nock(clients[0].uri)
        .matchHeader('podium-server-id', 'supah-server-2')
        .get('/podlet/test-crash-dummies/some/path')
        .reply(200, 'SUPPA ER OK');

    // request the resource
    const result = await supertest(app)
        .get('/podlet/test-crash-dummies/some/path');


    const error = result.error;
    t.falsy(error, 'request for podlet resource should not fail');
    t.true(errors.length === 0);
    const text = result.res.text;
    t.true(text === 'SUPPA ER OK');
});

test.serial('should serve POST routes from manifest', async t => {
    const app = express();
    const clients = [
        new PodletClient('test-crash-dummies', {
            fallback: 'OFFLINE!',
        }),
    ];
    const resourceProxy = new ResourceProxy({
        serverId: 'supah-server-3',
        clients,
    });

    // answer with the podlet manifest
    nock(clients[0].uri)
        .get('/')
        .reply(200, getManifest());

    // trigger fetch of manifest / warm up
    await clients[0].fetch();

    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    t.true(errors.length === 0);

    nock(clients[0].uri)
        .matchHeader('podium-server-id', 'supah-server-3')
        .post('/podlet/test-crash-dummies/some/other/path', 'ER SUPPA GREI?')
        .reply(200, 'SUPPA ER OK');

    // request the POST resource
    const result2 = await supertest(app)
        .post('/podlet/test-crash-dummies/some/other/path')
        .type('form')
        .send('ER SUPPA GREI?');

    t.true(errors.length === 0);
    const text = result2.res.text;
    t.true(text === 'SUPPA ER OK');
});

test.serial('should serve GET with query routes from manifest', async t => {
    t.plan(4);

    const app = express();
    const clients = [
        new PodletClient('test-crash-dummies', {
            fallback: 'OFFLINE!',
        }),
    ];
    const resourceProxy = new ResourceProxy({
        serverId: 'supah-server-4',
        clients,
    });

    // answer with the podlet manifest
    nock(clients[0].uri)
        .get('/')
        .reply(200, getManifest());

    // trigger fetch of manifest / warm up
    await clients[0].fetch();

    app.use(resourceProxy.middleware());

    const errors = [];
    app.use((err, req, res, next) => {
        errors.push(err);
        next();
    });

    t.true(errors.length === 0);

    // Bug in nock, it matches if _no_ query: https://github.com/node-nock/nock/pull/829
    nock(clients[0].uri)
        .get('/podlet/test-crash-dummies/some/path')
        .matchHeader('podium-server-id', 'supah-server-4')
        .query(query => {
            t.deepEqual(query, {
                super: '4',
            });

            return true;
        })
        .reply(200, 'SUPPA ER FULL AV FLUER');

    // request the query param resource
    const result3 = await supertest(app)
        .get('/podlet/test-crash-dummies/some/path?super=4&foo=bar');

    t.true(errors.length === 0);
    const text = result3.res.text;
    t.true(text === 'SUPPA ER FULL AV FLUER');
});


test.todo('should proxy valid resource routes');