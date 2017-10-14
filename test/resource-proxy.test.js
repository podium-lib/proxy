'use strict';

const configLoader = require('@finn-no/config-loader');

const configDefs = require('../config');

const mockPipe = jest.fn();

jest.mock('@finn-no/proxy-services', () => ({
    pipeServiceFactory() {
        return mockPipe;
    },
}));

const ResourceProxy = require('../lib/resource-proxy.js');

const config = configLoader({
    paths: [],
    extraDefinitions: configDefs,
    env: { APP_NAME: 'server-id' },
});

test('should throw on missing args', () => {
    /* eslint-disable no-new */
    expect(() => {
        new ResourceProxy();
    }).toThrowError();
    /* eslint-enable */
});

test('should pass through correct arguments to pipeservce', () => {
    const path = '/some/path';
    const resourceUri = 'http://example.com/podlets';
    const req = {
        query: { foo: 'bar' },
        method: 'GET',
        podiumContext: {},
    };
    const res = {};
    const proxy = new ResourceProxy(config);

    proxy.request(resourceUri, path, req, res);

    expect(mockPipe).toHaveBeenCalledTimes(1);
    expect(mockPipe).toHaveBeenCalledWith({
        headers: {
            'podium-server-id': 'podium',
        },
        ignoreClientDisconnects: true,
        method: 'GET',
        query: { foo: 'bar' },
        req,
        res,
        uri: resourceUri + path,
    });
});
