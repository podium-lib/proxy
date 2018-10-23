'use strict';

const express = require('express');
const http = require('http');
const { URL } = require('url');
const Proxy = require('../');

/**
 * Destination server utility
 * Spinns up a http server and responds on all pathnames.
 * Responds with meta data on the request
 */

class DestinationServer {
    constructor() {
        this.server = undefined;
        this.address = '';

        this.app = express();
        this.app.use((req, res) => {
            res.status(200).json({
                headers: req.headers,
                method: req.method,
                query: req.query,
                type: 'destination',
                url: `${this.address}${req.url}`,
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

/**
 * Proxy server utility
 * Spinns up a http server and attaches the proxy module
 */

class ProxyServer {
    constructor(manifests = []) {
        this.app = express();

        this.proxy = new Proxy({
            pathname: '/layout/',
            prefix: 'proxy',
        });

        manifests.forEach(manifest => {
            this.proxy.register(manifest);
        });

        this.app.use((req, res, next) => {
            res.locals = {};
            res.locals.podium = {};
            res.locals.podium.context = {
                'podium-foo': 'bar',
            };
            next();
        });

        this.app.use(this.proxy.middleware());

        this.app.use((req, res) => {
            res.status(404).json({
                message: 'not found',
                status: 404,
                type: 'proxy',
            });
        });

        this.server = undefined;
        this.address = '';
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

    get(pathname = '/') {
        return new Promise((resolve, reject) => {
            const address = new URL(pathname, this.address);
            http.get(address, res => {
                const chunks = [];
                res.on('data', chunk => {
                    chunks.push(chunk);
                });
                res.on('end', () => {
                    resolve(JSON.parse(chunks.join('')));
                });
            }).on('error', error => {
                reject(error);
            });
        });
    }

    post(pathname = '/', payload = '') {
        return new Promise((resolve, reject) => {
            const address = new URL(pathname, this.address);
            const options = {
                hostname: address.hostname,
                port: address.port,
                path: address.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(payload),
                },
            };

            const req = http
                .request(options, res => {
                    const chunks = [];
                    res.on('data', chunk => {
                        chunks.push(chunk);
                    });
                    res.on('end', () => {
                        resolve(JSON.parse(chunks.join('')));
                    });
                })
                .on('error', error => {
                    reject(error);
                });

            req.write(payload);
            req.end();
        });
    }
}

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/path"', async () => {
    const server = new DestinationServer();
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
    await proxy.listen();

    const result = await proxy.get('/layout/proxy/bar/a');
    expect(result.type).toEqual('destination');
    expect(result.method).toEqual('GET');
    expect(result.url).toEqual(`${serverAddr}/some/path`);

    await proxy.close();
    await server.close();
});

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/path"', async () => {
    const server = new DestinationServer();
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
    await proxy.listen();

    const result = await proxy.get('/layout/proxy/foo/b');
    expect(result.type).toEqual('destination');
    expect(result.method).toEqual('GET');
    expect(result.url).toEqual(`${serverAddr}/some/where/else`);

    await proxy.close();
    await server.close();
});

test('Proxying() - mount multiple proxies on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to destinations', async () => {
    const server = new DestinationServer();
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
    await proxy.listen();

    const resultBar = await proxy.get('/layout/proxy/bar/a');
    expect(resultBar.type).toEqual('destination');
    expect(resultBar.method).toEqual('GET');
    expect(resultBar.url).toEqual(`${serverAddr}/some/path`);

    const resultFoo = await proxy.get('/layout/proxy/foo/b');
    expect(resultFoo.type).toEqual('destination');
    expect(resultFoo.method).toEqual('GET');
    expect(resultFoo.url).toEqual(`${serverAddr}/some/where/else`);

    await proxy.close();
    await server.close();
});

test('Proxying() - GET request with query params - should proxy query params to "{destination}/some/path"', async () => {
    const server = new DestinationServer();
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
    await proxy.listen();

    const result = await proxy.get('/layout/proxy/bar/a?foo=bar');
    expect(result.type).toEqual('destination');
    expect(result.method).toEqual('GET');
    expect(result.query).toEqual({ foo: 'bar' });

    await proxy.close();
    await server.close();
});

test('Proxying() - POST request - should proxy query params to "{destination}/some/path"', async () => {
    const server = new DestinationServer();
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
    await proxy.listen();

    const result = await proxy.post('/layout/proxy/bar/a', 'payload');
    expect(result.type).toEqual('destination');
    expect(result.method).toEqual('POST');

    await proxy.close();
    await server.close();
});
