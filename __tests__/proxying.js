'use strict';

const {
    destinationObjectStream,
    HttpServer,
    request
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

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/path"', async () => {
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

    const { body } = await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a', json: true });

    expect(body.type).toEqual('destination');
    expect(body.method).toEqual('GET');
    expect(body.url).toEqual(`${serverAddr}/some/path`);

    await proxy.close();
    await server.close();
});

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/where/else"', async () => {
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

    const { body } = await request({ address: proxyAddr, pathname: '/layout/proxy/foo/b', json: true });

    expect(body.type).toEqual('destination');
    expect(body.method).toEqual('GET');
    expect(body.url).toEqual(`${serverAddr}/some/where/else`);

    await proxy.close();
    await server.close();
});

test('Proxying() - mount multiple proxies on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to destinations', async () => {
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

    const resultA = await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a', json: true });
    expect(resultA.body.type).toEqual('destination');
    expect(resultA.body.method).toEqual('GET');
    expect(resultA.body.url).toEqual(`${serverAddr}/some/path`);

    const resultB = await request({ address: proxyAddr, pathname: '/layout/proxy/foo/b', json: true });
    expect(resultB.body.type).toEqual('destination');
    expect(resultB.body.method).toEqual('GET');
    expect(resultB.body.url).toEqual(`${serverAddr}/some/where/else`);

    await proxy.close();
    await server.close();
});

test('Proxying() - GET request with additional path values - should proxy to "{destination}/some/path/extra?foo=bar"', async () => {
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

    const { body } = await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a/extra?foo=bar', json: true });

    expect(body.type).toEqual('destination');
    expect(body.method).toEqual('GET');
    expect(body.url).toEqual(`${serverAddr}/some/path/extra?foo=bar`);

    await proxy.close();
    await server.close();
});

test('Proxying() - GET request with query params - should proxy query params to "{destination}/some/path"', async () => {
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

    const { body } = await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a?foo=bar', json: true });

    expect(body.type).toEqual('destination');
    expect(body.method).toEqual('GET');
    expect(body.url).toEqual(`${serverAddr}/some/path?foo=bar`);

    await proxy.close();
    await server.close();
});

test('Proxying() - POST request - should proxy query params to "{destination}/some/path"', async () => {
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

    const { body } = await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a', method: 'POST', json: true }, 'payload');

    expect(body.type).toEqual('destination');
    expect(body.method).toEqual('POST');
    expect(body.url).toEqual(`${serverAddr}/some/path`);

    await proxy.close();
    await server.close();
});

test('Proxying() - metrics collection', async done => {
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
            expect(arr).toHaveLength(3);
            expect(arr[0].name).toBe('podium_proxy_process');
            expect(arr[0].type).toBe(5);
            expect(arr[0].labels).toEqual([
                { name: 'name', value: '' },
                { name: 'podlet', value: null },
                { name: 'proxy', value: false },
                { name: 'error', value: false },
            ]);
            expect(arr[1].labels).toEqual([
                { name: 'name', value: '' },
                { name: 'podlet', value: 'foo' },
                { name: 'proxy', value: true },
                { name: 'error', value: false },
            ]);
            expect(arr[2].labels).toEqual([
                { name: 'name', value: '' },
                { name: 'podlet', value: 'bar' },
                { name: 'proxy', value: true },
                { name: 'error', value: false },
            ]);
            done();
        }),
    );

    const proxyAddr = await proxy.listen();

    await request({ address: proxyAddr, pathname: '/layout/proxy/foo/a' });
    await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a' });

    await proxy.close();
    await server.close();

    proxy.proxy.metrics.push(null);
});

test('Proxying() - proxy to a non existing server - GET request will error - should collect error metric', async done => {
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
            expect(arr).toHaveLength(1);
            expect(arr[0].name).toBe('podium_proxy_process');
            expect(arr[0].type).toBe(5);
            expect(arr[0].labels).toEqual([
                { name: 'name', value: '' },
                { name: 'podlet', value: 'bar' },
                { name: 'proxy', value: true },
                { name: 'error', value: true },
            ]);

            done();
        }),
    );

    await request({ address: proxyAddr, pathname: '/layout/proxy/bar/a' });

    await proxy.close();

    proxy.proxy.metrics.push(null);
});
