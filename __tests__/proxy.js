'use strict';

const Proxy = require('../');

/**
 * Constructor
 */

test('Proxy() - object tag - should be PodiumProxy', () => {
    const proxy = new Proxy();
    expect(Object.prototype.toString.call(proxy)).toEqual(
        '[object PodiumProxy]'
    );
});

/**
 * .register()
 */

test('.register() - no value given to "manifest" argument - should throw', () => {
    expect.hasAssertions();
    const proxy = new Proxy();
    expect(() => {
        proxy.register();
    }).toThrowError(
        'The value for the required argument "manifest" not defined or not valid.'
    );
});

test('.register() - invalid value given to "manifest" argument - should throw', () => {
    expect.hasAssertions();
    const proxy = new Proxy();
    expect(() => {
        proxy.register({ foo: 'bar', name: 'æøå - tada' });
    }).toThrowError(
        'The value for the required argument "manifest" not defined or not valid.'
    );
});

test('.register() - valid value given to "manifest" argument - should set value in internal registry', () => {
    const proxy = new Proxy();
    proxy.register({
        name: 'bar',
        proxy: {
            a: `/some/path`,
        },
        version: '1.0.0',
        content: '/',
    });
    const result = proxy.dump();
    expect(result[0][0]).toEqual('bar');
});
