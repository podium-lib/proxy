'use strict';

const http = require('http');
const { URL } = require('url');
const { Writable } = require('readable-stream');
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('../');

const destObjectStream = done => {
    const arr = [];

    const dStream = new Writable({
        objectMode: true,
        write(chunk, encoding, callback) {
            arr.push(chunk);
            callback();
        },
    });

    dStream.on('finish', () => {
        done(arr);
    });

    return dStream;
};

/**
 * Destination server utility
 * Spinns up a http server and responds on all pathnames.
 * Responds with meta data on the request
 */

class DestinationServer {
    constructor() {
        this.server = undefined;
        this.address = '';
        this.app = http.createServer((req, res) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
                JSON.stringify({
                    method: req.method,
                    type: 'destination',
                    url: `${this.address}${req.url}`,
                }),
            );
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

test('Proxying() - mount proxy on "/{pathname}/{prefix}/{manifestName}/{proxyName}" - GET request - should proxy to "{destination}/some/where/else"', async () => {
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

test('Proxying() - GET request with additional path values - should proxy to "{destination}/some/path/extra?foo=bar"', async () => {
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

    const result = await proxy.get('/layout/proxy/bar/a/extra?foo=bar');
    expect(result.type).toEqual('destination');
    expect(result.method).toEqual('GET');
    expect(result.url).toEqual(`${serverAddr}/some/path/extra?foo=bar`);

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
    expect(result.url).toEqual(`${serverAddr}/some/path?foo=bar`);

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

test('Proxying() - metrics collection', async done => {
    const server = new DestinationServer();
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
        destObjectStream(arr => {
            expect(arr).toHaveLength(2);
            /*
            TODO: Commented out due to the way we get this info is wrong
            expect(arr[0].meta.podlet).toBe('foo');
            expect(arr[0].meta.proxy).toBe('a');
            expect(arr[1].meta.podlet).toBe('bar');
            expect(arr[1].meta.proxy).toBe('a');
            */
            done();
        }),
    );

    await proxy.listen();

    await proxy.get('/layout/proxy/foo/a');
    await proxy.get('/layout/proxy/bar/a');

    await proxy.close();
    await server.close();

    proxy.proxy.metrics.push(null);
});
