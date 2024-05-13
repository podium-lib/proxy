import tap from 'tap';
import { exec } from 'child_process';
import {
    destinationObjectStream,
    HttpServer,
    request,
} from '@podium/test-utils';
import { HttpIncoming } from '@podium/utils';
import http from 'http';
import Proxy from '../lib/proxy.js';

// NOTE: This file can be removed when object notation on the proxy property is
//       removed from the schema and the manifest only support an array for the
//       proxy property.

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
 * Spins up a http server and attaches the proxy module
 */

class ProxyServer {
    constructor(manifests = [], options = {}) {
        this.server = undefined;
        this.address = '';

        this.proxy = new Proxy({
            pathname: '/layout/',
            prefix: 'proxy',
        });

        manifests.forEach((arr) => {
            const [name, manifest] = arr;
            this.proxy.register(name, manifest);
        });

        this.app = http.createServer((req, res) => {
            // @ts-ignore Mimix express for the test
            res.locals = {};
            // @ts-ignore Mimix express for the test
            res.locals.podium = {};
            // @ts-ignore Mimix express for the test
            res.locals.podium.context = {
                'podium-foo': 'bar',
            };
            // @ts-ignore Mimix express for the test
            const incoming = new HttpIncoming(req, res, res.locals);
            if (options.name) incoming.name = options.name;
            this.proxy
                .process(incoming)
                .then((result) => {
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
        return new Promise((resolve) => {
            this.server = this.app.listen(0, '0.0.0.0', () => {
                this.address = `http://${this.server.address().address}:${
                    this.server.address().port
                }`;

                resolve(this.address);
            });
        });
    }

    close() {
        return /** @type {Promise<void>} */ (
            new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            })
        );
    }
}

tap.test(
    'Proxying() - mount proxy on "/{localLayoutPathname}/{proxyPrefixName}/{localPodletName}/{podletProxyTargetName}" - GET request - should proxy to "{destination}/some/path"',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;

        const serverAddr = await server.listen();

        const proxy = new ProxyServer([
            [
                'local-podlet-name',
                {
                    name: 'bar',
                    proxy: {
                        a: `${serverAddr}/some/path`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ]);
        const proxyAddr = await proxy.listen();

        const { body } = await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name/a',
            json: true,
        });

        t.equal(body.type, 'destination');
        t.equal(body.method, 'GET');
        t.equal(body.url, `${serverAddr}/some/path`);

        await proxy.close();
        await server.close();

        t.end();
    },
);

tap.test(
    'Proxying() - mount proxy on "/{localLayoutPathname}/{proxyPrefixName}/{localPodletName}/{podletProxyTargetName}" - GET request - should proxy to "{destination}/some/where/else"',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;

        const serverAddr = await server.listen();

        const proxy = new ProxyServer([
            [
                'local-podlet-name',
                {
                    name: 'foo',
                    proxy: {
                        b: `${serverAddr}/some/where/else`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ]);
        const proxyAddr = await proxy.listen();

        const { body } = await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name/b',
            json: true,
        });

        t.equal(body.type, 'destination');
        t.equal(body.method, 'GET');
        t.equal(body.url, `${serverAddr}/some/where/else`);

        await proxy.close();
        await server.close();

        t.end();
    },
);

tap.test(
    'Proxying() - mount multiple proxies on "/{localLayoutPathname}/{proxyPrefixName}/{localPodletName}/{podletProxyTargetName}" - GET request - should proxy to destinations',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;

        const serverAddr = await server.listen();

        const proxy = new ProxyServer([
            [
                'local-podlet-name-bar',
                {
                    name: 'bar',
                    proxy: {
                        a: `${serverAddr}/some/path`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
            [
                'local-podlet-name-foo',
                {
                    name: 'foo',
                    proxy: {
                        b: `${serverAddr}/some/where/else`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ]);
        const proxyAddr = await proxy.listen();

        const resultA = await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name-bar/a',
            json: true,
        });

        t.equal(resultA.body.type, 'destination');
        t.equal(resultA.body.method, 'GET');
        t.equal(resultA.body.url, `${serverAddr}/some/path`);

        const resultB = await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name-foo/b',
            json: true,
        });

        t.equal(resultB.body.type, 'destination');
        t.equal(resultB.body.method, 'GET');
        t.equal(resultB.body.url, `${serverAddr}/some/where/else`);

        await proxy.close();
        await server.close();

        t.end();
    },
);

tap.test(
    'Proxying() - GET request with additional path values - should proxy to "{destination}/some/path/extra?foo=bar"',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;

        const serverAddr = await server.listen();

        const proxy = new ProxyServer([
            [
                'local-podlet-name',
                {
                    name: 'bar',
                    proxy: {
                        a: `${serverAddr}/some/path`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ]);
        const proxyAddr = await proxy.listen();

        const { body } = await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name/a/extra?foo=bar',
            json: true,
        });

        t.equal(body.type, 'destination');
        t.equal(body.method, 'GET');
        t.equal(body.url, `${serverAddr}/some/path/extra?foo=bar`);

        await proxy.close();
        await server.close();

        t.end();
    },
);

tap.test(
    'Proxying() - GET request with query params - should proxy query params to "{destination}/some/path"',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;

        const serverAddr = await server.listen();

        const proxy = new ProxyServer([
            [
                'local-podlet-name',
                {
                    name: 'bar',
                    proxy: {
                        a: `${serverAddr}/some/path`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ]);
        const proxyAddr = await proxy.listen();

        const { body } = await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name/a?foo=bar',
            json: true,
        });

        t.equal(body.type, 'destination');
        t.equal(body.method, 'GET');
        t.equal(body.url, `${serverAddr}/some/path?foo=bar`);

        await proxy.close();
        await server.close();

        t.end();
    },
);

tap.test(
    'Proxying() - POST request - should proxy query params to "{destination}/some/path"',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;

        const serverAddr = await server.listen();

        const proxy = new ProxyServer([
            [
                'local-podlet-name',
                {
                    name: 'bar',
                    proxy: {
                        a: `${serverAddr}/some/path`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ]);
        const proxyAddr = await proxy.listen();

        const { body } = await request(
            {
                address: proxyAddr,
                pathname: '/layout/proxy/local-podlet-name/a',
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
    },
);

tap.test('Proxying() - metrics collection', async (t) => {
    const server = new HttpServer();
    server.request = reqFn;

    const serverAddr = await server.listen();

    const proxy = new ProxyServer(
        [
            [
                'local-podlet-name-foo',
                {
                    name: 'foo',
                    proxy: {
                        a: '/foo',
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
            [
                'local-podlet-name-bar',
                {
                    name: 'bar',
                    proxy: {
                        a: `${serverAddr}/some/path`,
                    },
                    version: '1.0.0',
                    content: '/',
                },
            ],
        ],
        { name: 'mylayout' },
    );

    proxy.proxy.metrics.pipe(
        destinationObjectStream((arr) => {
            t.equal(arr.length, 3);
            t.equal(arr[0].name, 'podium_proxy_process');
            t.equal(arr[0].type, 5);
            t.match(arr[0].labels, [
                { name: 'name', value: 'mylayout' },
                { name: 'podlet', value: null },
                { name: 'proxy', value: false },
                { name: 'error', value: false },
            ]);
            t.match(arr[0].meta, {
                buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 10],
            });
            t.match(arr[1].labels, [
                { name: 'name', value: 'mylayout' },
                { name: 'podlet', value: 'foo' },
                { name: 'proxy', value: true },
                { name: 'error', value: false },
            ]);
            t.match(arr[1].meta, {
                buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 10],
            });
            t.match(arr[2].labels, [
                { name: 'name', value: 'mylayout' },
                { name: 'podlet', value: 'bar' },
                { name: 'proxy', value: true },
                { name: 'error', value: false },
            ]);
            t.match(arr[2].meta, {
                buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 10],
            });
        }),
    );

    const proxyAddr = await proxy.listen();

    await request({
        address: proxyAddr,
        pathname: '/layout/proxy/local-podlet-name-foo/a',
    });
    await request({
        address: proxyAddr,
        pathname: '/layout/proxy/local-podlet-name-bar/a',
    });

    proxy.proxy.metrics.push(null);

    await proxy.close();
    await server.close();

    t.end();
});

tap.test(
    'Proxying() - proxy to a non existing server - GET request will error - should collect error metric',
    async (t) => {
        const serverAddr = 'http://0.0.0.0:9854';

        const proxy = new ProxyServer(
            [
                [
                    'local-podlet-name',
                    {
                        name: 'bar',
                        proxy: {
                            a: `${serverAddr}/some/path`,
                        },
                        version: '1.0.0',
                        content: '/',
                    },
                ],
            ],
            { name: 'mylayout' },
        );

        const proxyAddr = await proxy.listen();

        proxy.proxy.metrics.pipe(
            destinationObjectStream((arr) => {
                t.equal(arr.length, 1);
                t.equal(arr[0].name, 'podium_proxy_process');
                t.equal(arr[0].type, 5);
                t.match(arr[0].labels, [
                    { name: 'name', value: 'mylayout' },
                    { name: 'podlet', value: 'local-podlet-name' },
                    { name: 'proxy', value: true },
                    { name: 'error', value: true },
                ]);
            }),
        );

        await request({
            address: proxyAddr,
            pathname: '/layout/proxy/local-podlet-name/a',
        });

        proxy.proxy.metrics.push(null);

        await proxy.close();

        t.end();
    },
);

tap.test(
    'Proxying() - Trailer header - 400s when Trailer header is present',
    async (t) => {
        const server = new HttpServer();
        server.request = reqFn;
        const serverAddr = await server.listen();

        const proxy = new ProxyServer(
            [
                [
                    'local-podlet-name',
                    {
                        name: 'foo',
                        proxy: {
                            a: `${serverAddr}/some/path`,
                        },
                        version: '1.0.0',
                        content: '/',
                    },
                ],
            ],
            { name: 'mylayout' },
        );

        const proxyAddr = await proxy.listen();

        const { stdout } = await new Promise((resolve, reject) => {
            exec(
                `curl -i -H 'Trailer: Krynos' -H 'User-Agent: Mozilla' '${proxyAddr}/layout/proxy/local-podlet-name/a'`,
                (error, stdoutput, stderror) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve({ stdout: stdoutput, stderr: stderror });
                },
            );
        });

        t.match(
            stdout,
            '400 Bad Request',
            'Including Trailer header results in 400',
        );

        await proxy.close();
        await server.close();

        t.end();
    },
);
