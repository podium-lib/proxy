'use strict';

const express = require('express');
const Proxy = require('../');

// Dummy remote target servers
const remoteA = express();
remoteA.get('*', (req, res) => {
    console.log('remote A server:', req.url);
    console.log('remote A server:', req.headers);
    setTimeout(() => {
        res.status(200).send('Remote A\n');
    }, 2000);
});
remoteA.listen(6001);

const remoteB = express();
remoteB.get('*', (req, res) => {
    console.log('remote B server:', req.url);
    console.log('remote B server:', req.headers);
    res.status(200).send('Remote B\n');
});
remoteB.listen(6002);

// Set up express server
const app = express();

// Set up proxy
const proxy = new Proxy({
    logger: console,
    name: 'foo',
});

// Register remote targets on their separate namespace
proxy.register({
    name: 'foo',
    proxy: {
        a: 'http://localhost:6001/',
        b: 'http://localhost:6002/some/other/path',
    },
    version: '1.0.0',
    content: '/foo',
});
proxy.register({
    name: 'bar',
    proxy: {
        b: 'http://localhost:6002/some/path',
    },
    version: '1.0.0',
    content: '/bar',
});

app.use((req, res, next) => {
    res.locals = {};
    res.locals.podium = {};
    res.locals.podium.context = {
        'podium-foo': 'bar',
    };
    next();
});

// Attach proxy middleware on a root namespace
app.use(proxy.middleware('/prefix'));

// General error handling
app.use((error, req, res, next) => {
    if (error) {
        res.status(500).send('Internal server error');
        return;
    }
    next();
});

app.use((req, res) => {
    res.status(404).send('Not found');
});

// Start appserver where proxy is attached
app.listen(9999);
