'use strict';

const express = require('express');
const Proxy = require('../');
const http = require('http');

/**
 * Fake destination server utility
 * Spinns up a http server and responds on all pathnames.
 * Responds with meta data on the request
 */

class DestinationServer {
    constructor() {
        this.app = express();
        this.app.use((req, res) => {
            res.status(200).json({
                headers: req.headers,
                query: req.query,
                type: 'destination',
                url: req.url,
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
}

/**
 * Fake proxy server utility
 * Spinns up a http server and attaches the proxy module
 */

class ProxyServer {
    constructor(manifests = []) {
        this.app = express();

        this.proxy = new Proxy({
            pathname: '/my-layout/',
            prefix: 'proxy'
        });

        manifests.forEach((manifest) => {
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
}

test('Proxying() - foo - should bar', async () => {
    const server = new DestinationServer();
    const serverAddr = await server.listen();

    const proxy = new ProxyServer([
        {
            name: 'bar',
            proxy: {
                b: `${serverAddr}/some/path`,
            },
            version: '1.0.0',
            content: '/bar',
        }
    ]);
    await proxy.listen();

    const result = await proxy.get('/my-layout/proxy/bar/b');
    expect(result.type).toEqual('destination');

    await proxy.close();
    await server.close();
});
