'use strict';

const { test } = require('tap');
const {
    destinationObjectStream,
    HttpServer,
    request,
} = require('@podium/test-utils');
const { HttpIncoming } = require('@podium/utils');
const http = require('http');

const Proxy = require('../');

const reqFn = (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
        JSON.stringify({
            method: req.method,
            type: 'destination',
            url: `http://${req.headers.host}${req.url}`,
        }),
    );
};

/**
 * Proxy server utility
 * Spinns up a http server and attaches the proxy module
 */

class ProxyServer {
    constructor(manifests = []) {
        this.server = undefined;
        this.address = '';

        this.proxy = new Proxy({
            pathname: '/layout/',
            prefix: 'proxy',
        });

        manifests.forEach(manifest => {
            this.proxy.register(manifest);
        });

        this.app = http.createServer((req, res) => {
            res.locals = {};
            res.locals.podium = {};
            res.locals.podium.context = {
                'podium-foo': 'bar',
            };
            const incoming = new HttpIncoming(req, res, res.locals);
            this.proxy
                .process(incoming)
                .then(result => {
                    if (result.proxy) return;
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                        JSON.stringify({
                            message: 'ok',
                            status: 200,
                            type: 'proxy',
                        }),
                    );
                })
                .catch(() => {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(
                        JSON.stringify({
                            message: 'not found',
                            status: 404,
                            type: 'proxy',
                        }),
                    );
                });
        });
    }

    listen() {
        return new Promise(resolve => {
            this.server = this.app.listen(0, 'localhost', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;

                resolve(this.address);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.server.close(err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/path"', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    const { body } = await request({
        address: proxyAddr,
        pathname: '/layout/proxy/bar/a',
        json: true,
    });

    t.equal(body.type, 'destination');
    t.equal(body.method, 'GET');
    t.equal(body.url, `${serverAddr}/some/path`);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/where/else"', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'foo',
            proxy: {
                b: `${serverAddr}/some/where/else`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    const { body } = await request({
        address: proxyAddr,
        pathname: '/layout/proxy/foo/b',
        json: true,
    });

    t.equal(body.type, 'destination');
    t.equal(body.method, 'GET');
    t.equal(body.url, `${serverAddr}/some/where/else`);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - mount multiple proxies on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to destinations', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
        {
            name: 'foo',
            proxy: {
                b: `${serverAddr}/some/where/else`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    const resultA = await request({
        address: proxyAddr,
        pathname: '/layout/proxy/bar/a',
        json: true,
    });

    t.equal(resultA.body.type, 'destination');
    t.equal(resultA.body.method, 'GET');
    t.equal(resultA.body.url, `${serverAddr}/some/path`);

    const resultB = await request({
        address: proxyAddr,
        pathname: '/layout/proxy/foo/b',
        json: true,
    });

    t.equal(resultB.body.type, 'destination');
    t.equal(resultB.body.method, 'GET');
    t.equal(resultB.body.url, `${serverAddr}/some/where/else`);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - GET request with additional path values - should proxy to "{destination}/some/path/extra?foo=bar"', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    const { body } = await request({
        address: proxyAddr,
        pathname: '/layout/proxy/bar/a/extra?foo=bar',
        json: true,
    });

    t.equal(body.type, 'destination');
    t.equal(body.method, 'GET');
    t.equal(body.url, `${serverAddr}/some/path/extra?foo=bar`);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - GET request with query params - should proxy query params to "{destination}/some/path"', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    const { body } = await request({
        address: proxyAddr,
        pathname: '/layout/proxy/bar/a?foo=bar',
        json: true,
    });

    t.equal(body.type, 'destination');
    t.equal(body.method, 'GET');
    t.equal(body.url, `${serverAddr}/some/path?foo=bar`);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - POST request - should proxy query params to "{destination}/some/path"', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    const { body } = await request(
        {
            address: proxyAddr,
            pathname: '/layout/proxy/bar/a',
            method: 'POST',
            json: true,
        },
        'payload',
    );

    t.equal(body.type, 'destination');
    t.equal(body.method, 'POST');
    t.equal(body.url, `${serverAddr}/some/path`);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - metrics collection', async t => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'foo',
            proxy: {
                a: '/foo',
            },
            version: '1.0.0',
            content: '/',
        },
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);

    proxy.proxy.metrics.pipe(
        destinationObjectStream(arr => {
            t.equal(arr.length, 3);
            t.equal(arr[0].name, 'podium_proxy_process');
            t.equal(arr[0].type, 5);
            t.match(arr[0].labels, [
                { name: 'name', value: '' },
                { name: 'podlet', value: null },
                { name: 'proxy', value: false },
                { name: 'error', value: false },
            ]);
            t.match(arr[1].labels, [
                { name: 'name', value: '' },
                { name: 'podlet', value: 'foo' },
                { name: 'proxy', value: true },
                { name: 'error', value: false },
            ]);
            t.match(arr[2].labels, [
                { name: 'name', value: '' },
                { name: 'podlet', value: 'bar' },
                { name: 'proxy', value: true },
                { name: 'error', value: false },
            ]);
        }),
    );

    const proxyAddr = await proxy.listen();

    await request({ address: proxyAddr, pathname: '/layout/proxy/foo/a' });
    await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a' });

    proxy.proxy.metrics.push(null);

    await proxy.close();
    await server.close();

    t.end();
});

test('Proxying() - proxy to a non existing server - GET request will error - should collect error metric', async t => {
    const serverAddr = 'http://localhost:9854';

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                a: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/',
        },
    ]);
    const proxyAddr = await proxy.listen();

    proxy.proxy.metrics.pipe(
        destinationObjectStream(arr => {
            t.equal(arr.length, 1);
            t.equal(arr[0].name, 'podium_proxy_process');
            t.equal(arr[0].type, 5);
            t.match(arr[0].labels, [
                { name: 'name', value: '' },
                { name: 'podlet', value: 'bar' },
                { name: 'proxy', value: true },
                { name: 'error', value: true },
            ]);
        }),
    );

    await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a' });

    proxy.proxy.metrics.push(null);

    await proxy.close();

    t.end();
});
