'use strict';

const configLoader = require('@finn-no/config-loader');

const configDefs = require('../config');

const mockPipe = jest.fn();

jest.mock('../lib/proxy-services', () => ({
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

test('should pass through correct arguments to pipeservce', () => {
    const resourceUri = 'http://example.com/podlets/some/path';
    const req = {
        query: { foo: 'bar' },
        method: 'GET',
        params: {
            podletName: 'resource',
        },
    };
    const res = {
        locals: {
            podium: {
                context: {},
            },
        },
    };
    const proxy = new ResourceProxy('someApp', config);

    proxy.request(resourceUri, req, res);

    expect(mockPipe).toHaveBeenCalledTimes(1);
    expect(mockPipe).toHaveBeenCalledWith({
        headers: {},
        ignoreClientDisconnects: true,
        method: 'GET',
        query: { foo: 'bar' },
        req,
        res,
        timeout: 60000,
        uri: resourceUri,
    });
});