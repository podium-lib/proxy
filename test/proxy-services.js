'use strict';

const { PassThrough, Transform } = require('readable-stream');
const createServer = require('create-test-server');
const got = require('got');
const { get } = require('http');
const { parse } = require('url');
const logger = require('@finn-no/fiaas-logger');
const { browserMiddleware, internalMiddleware } = require('@podium/context');
const bodyParser = require('body-parser');
const compression = require('compression');
const configLoader = require('@finn-no/config-loader');
const contextConfig = require('@podium/context/config');
const configDefs = require('./config');

function getConfig(env = {}) {
    return configLoader({
        paths: [],
        extraDefinitions: Object.assign({}, contextConfig, configDefs),
        env,
    });
}

const { pipeServiceFactory, _SUPPRESSED_ERROR } = require('../lib/proxy-services');

beforeAll(() => {
    logger.setLogLevel(logger.logLevels.OFF);
});

afterAll(() => {
    logger.setLogLevel(logger.logLevels.ON);
});

const headers = {
    Connection: 'close',
};

let server;
let endpointServer;
let pipePromise;

beforeEach(async () => {
    jest.setTimeout(20000);
    const [server1, server2] = await Promise.all([
        createServer(),
        createServer(),
    ]);

    endpointServer = server1;
    server = server2;

    const config = getConfig();

    const pipeService = pipeServiceFactory(config, {
        factor: 1,
        minTimeout: 50,
    });

    const randomUrl = Math.random();
    let numberOfBoomsAllowed = 1;

    endpointServer.use(bodyParser.json());
    endpointServer.use(internalMiddleware(config));

    endpointServer.get('/', (req, res) => res.json(req.query));
    endpointServer.get('/redirect', (req, res) =>
        res.redirect(`/redirect-target-${randomUrl}`),
    );
    endpointServer.get('/boom', () => {
        throw new Error('This is planned!');
    });
    endpointServer.get('/boom-twice', (req, res) => {
        if (numberOfBoomsAllowed--) {
            logger.debug(`Went boom! ${numberOfBoomsAllowed} to go.`);
            res.sendStatus(503);

            return;
        }

        res.sendStatus(204);
    });
    // Random URL so it can't be guessed
    endpointServer.get(`/redirect-target-${randomUrl}`, (req, res) =>
        res.json({ msg: 'you found me!' }),
    );
    endpointServer.get('/headers', (req, res) => {
        res.set('X-SOME-HEADER', 'some value');
        res.json(req.query);
    });

    endpointServer.get('/ignore-headers', (req, res) => {
        res.set('X-SOME-HEADER', 'some value');
        res.json(req.query);
    });

    endpointServer.get('/transform', (req, res) => {
        res.json(req.query);
    });

    endpointServer.get('/COOKIE', (req, res) => {
        res.set('cookie', req.headers.cookie || 'no');
        res.json(req.query);
    });
    endpointServer.post('/', (req, res) => res.json({ yobro: req.body }));
    // eslint-disable-next-line no-unused-vars
    endpointServer.use((err, req, res, next) => {
        logger.error(err);

        res.sendStatus(503);
    });

    server.use(browserMiddleware(config));

    server.use('/IGNORE-DISCONNECTS', (req, res) => {
        pipePromise = pipeService(
            Object.assign({}, req, {
                req,
                res,
                ignoreClientDisconnects: true,
                uri: `${endpointServer.url}${req.baseUrl}`,
            }),
        );
    });

    server.use('/TIMEOUT', (req, res) => {
        pipeService(
            Object.assign({}, req, {
                req,
                res,
                timeout: 50,
                uri: `${endpointServer.url}${req.baseUrl}`,
            }),
        );
    });

    server.use('/COOKIE', (req, res) => {
        pipeService({
            req,
            res,
            uri: `${endpointServer.url}${req.baseUrl}`,
        });
    });

    server.use('/ignore-headers', (req, res) => {
        pipeService(
            Object.assign({}, req, {
                req,
                res,
                transform: (serviceRes /* , extractedHeaders*/) => {
                    res.set(serviceRes.status);
                    return new PassThrough();
                },
                uri: `${endpointServer.url}${req.baseUrl}`,
            }),
        );
    });

    server.use('/transform', (req, res) => {
        pipeService(
            Object.assign({}, req, {
                req,
                res,
                transform: (serviceRes /* , extractedHeaders*/) => {
                    res.set(serviceRes.status);

                    return new Transform({
                        transform(chunk, enc, next) {
                            this.push(
                                chunk
                                    .toString()
                                    .replace(/replace/g, 'with-this'),
                            );
                            next();
                        },
                    });
                },
                uri: `${endpointServer.url}${req.baseUrl}`,
            }),
        );
    });

    server.use('*', (req, res) => {
        pipeService(
            Object.assign({}, req, {
                req,
                res,
                uri: `${endpointServer.url}${req.baseUrl}`,
            }),
        );
    });
});

afterEach(() => Promise.all([endpointServer.close(), server.close()]));

test('get', async () => {
    const response = await got(`${server.url}/?sup=hai`, {
        json: true,
        headers,
    });

    expect(response.body).toEqual({ sup: 'hai' });
});

test('post', async () => {
    const response = await got(`${server.url}`, {
        json: true,
        body: { sup: 'hai again' },
        headers,
    });

    expect(response.body).toEqual({ yobro: { sup: 'hai again' } });
});

test('forward headers', async () => {
    const response = await got(`${server.url}/headers`, {
        json: true,
        headers,
    });

    expect(response.headers['x-some-header']).toBe('some value');
});

test('not forward headers of when transform does not copy headers', async () => {
    const response = await got(`${server.url}/ignore-headers`, {
        json: true,
        headers,
    });

    expect(response.headers['x-some-header']).toBeUndefined();
});

test('transform', async () => {
    const response = await got(`${server.url}/transform`, {
        json: true,
        headers,
        query: {
            'a-replace': 'value',
            'b-replace': 'value2',
        },
    });

    expect(response.body).toEqual({
        'a-with-this': 'value',
        'b-with-this': 'value2',
    });
});

test('redirect', async () => {
    const response = await got(`${server.url}/redirect`, {
        json: true,
        headers,
    });

    expect(response.body).toEqual({ msg: 'you found me!' });
});

test('404', async () => {
    try {
        await got(`${server.url}/this-is-gone`, { headers });
    } catch (error) {
        expect(error.statusCode).toBe(404);
    }
});

test('503', async () => {
    expect.hasAssertions();

    try {
        await got(`${server.url}/boom`, { headers });
    } catch (error) {
        expect(error.statusCode).toBe(503);
    }
});

test('retry on error', async () => {
    const response = await got(`${server.url}/boom-twice`, {
        headers,
    });

    expect(response.statusCode).toBe(204);
});

test('socket hangup', async () => {
    endpointServer.get('/socket-hangup', (req, res) => {
        res.writeHead(200);
        setTimeout(() => {
            res.connection.destroy();
        }, 100);
    });

    try {
        await got(`${server.url}/socket-hangup`, { headers });
    } catch (error) {
        expect(error.statusCode).toBe(503);
    }
});

test('ECONNREFUSED response socket destroyed', async () => {
    endpointServer.get('/ECONNREFUSED', (req, res) => {
        res.socket.destroy();
    });

    try {
        await got(`${server.url}/ECONNREFUSED`, { headers });
    } catch (error) {
        expect(error.statusCode).toBe(503);
    }
});

test('ECONNREFUSED request socket destroyed', async () => {
    endpointServer.get('/ECONNREFUSED', req => {
        req.socket.destroy();
    });

    try {
        await got(`${server.url}/ECONNREFUSED`, { headers });
    } catch (error) {
        expect(error.statusCode).toBe(503);
    }
});

test('ECONNREFUSED should retry', async () => {
    let counter = 1;
    endpointServer.get('/ECONNREFUSED-retry', (req, res) => {
        if (counter > 0) {
            res.socket.destroy();
            counter--;
            return;
        }
        res.end('OK');
    });

    const response = await got(`${server.url}/ECONNREFUSED-retry`, {
        headers,
    });

    expect(counter).toBe(0);
    expect(response.body).toBe('OK');
});

test('TIMEOUT', async () => {
    expect.hasAssertions();
    let counter = 2;
    endpointServer.get('/TIMEOUT', (req, res) => {
        res.writeHead(200);
        counter--;
    });

    try {
        await got(`${server.url}/TIMEOUT`, { headers });
    } catch (error) {
        expect(counter).toBe(0);
        expect(error.statusCode).toBe(503);
    }
});

test('handle gzipped content', async () => {
    endpointServer.use(compression({ filter: () => true }));
    endpointServer.get('/gzip', (req, res) => {
        res.writeHead(200);
        setImmediate(() => {
            res.end('this is text');
        });
    });

    const response = await got(`${server.url}/gzip`, {
        headers,
    });

    expect(response.headers['content-encoding']).toBe('gzip');
    expect(response.headers['transfer-encoding']).toBe('chunked');
    expect(response.body).toBe('this is text');
});

test('should ignore client disconnects if ignoreClientDisconnects = true and request is aborted', async () => {
    expect.assertions(2);

    let clientReq;

    endpointServer.get('/IGNORE-DISCONNECTS', (req, res) => {
        res.writeHead(200);
        setTimeout(() => {
            clientReq.abort();
            // trigger end on the pump()
            res.end('lets finish this thing, ok?');
        }, 200);
    });

    await new Promise((resolve, reject) => {
        const urlObj = parse(server.url);
        clientReq = get(
            {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: '/IGNORE-DISCONNECTS',
                timeout: 100,
                agent: false,
            },
            reject,
        ).on('error', e => {
            expect(e.message).toEqual('socket hang up');
            setTimeout(resolve, 150);
        });
    });

    const result = await pipePromise;
    expect(result).toBe(_SUPPRESSED_ERROR);
});

const DUMMY_PAYLOAD = '...DUMMY_PAYLOAD...'.repeat(100);

test('should ignore client disconnects if ignoreClientDisconnects = true and request is aborted while data is being written', async () => {
    let clientReq;

    function write(times, fn) {
        for (let i = 0; i < times; i++) {
            fn(DUMMY_PAYLOAD);
        }
    }

    endpointServer.get('/IGNORE-DISCONNECTS', (req, res) => {
        res.writeHead(200);
        write(50, res.write.bind(res));
        setTimeout(() => {
            write(50, res.write.bind(res));
            clientReq.abort();
            // trigger end on the pump()
            res.end('lets finish this thing, ok?');
        }, 100);
    });

    await new Promise((resolve, reject) => {
        const urlObj = parse(server.url);
        clientReq = get(
            {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: '/IGNORE-DISCONNECTS',
                timeout: 100,
                agent: false,
            },
            res => {
                res.on('end', resolve);
            },
        ).on('error', reject);
    });

    const result = await pipePromise;
    expect(result).toBe(_SUPPRESSED_ERROR);
});

test('should pass on USERID when origin has a cookie named USERID', async () => {
    const response = await got(`${server.url}/COOKIE`, {
        json: true,
        headers: {
            Connection: 'close',
            Cookie: 'USERID=12345;',
        },
    });

    expect(response.headers.cookie).toBe('USERID=12345;');
});

test('should not pass on USERID when origin does not contain a USERID', async () => {
    const response = await got(`${server.url}/COOKIE`, {
        json: true,
        headers: {
            Connection: 'close',
        },
    });

    expect(response.headers.cookie).toBe('no');
});

test('should pass on SESSION when origin has a cookie named SESSION', async () => {
    const response = await got(`${server.url}/COOKIE`, {
        json: true,
        headers: {
            Connection: 'close',
            Cookie: 'SESSION=12345;',
        },
    });

    expect(response.headers.cookie).toBe('SESSION=12345;');
});

test('should pass on mfinn_jsession when origin has a cookie named mfinn_jsession', async () => {
    const response = await got(`${server.url}/COOKIE`, {
        json: true,
        headers: {
            Connection: 'close',
            Cookie: 'mfinn_jsession=12345;',
        },
    });

    expect(response.headers.cookie).toBe('mfinn_jsession=12345;');
});

test('should pass on wanted cookies when origin has a cookie', async () => {
    const response = await got(`${server.url}/COOKIE`, {
        json: true,
        headers: {
            Connection: 'close',
            Cookie: 'mfinn_jsession=1;fluffy=duffy;USERID=2;SESSION=3;foo=bar;',
        },
    });

    expect(response.headers.cookie).toBe(
        'USERID=2;SESSION=3;mfinn_jsession=1;',
    );
});

test('test that res.headersSent is true, and serviceRes gets ended/aborted');
