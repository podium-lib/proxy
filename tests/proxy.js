'use strict';

const { test } = require('tap');
const Proxy = require('..');

test('Proxy() - object tag - should be PodiumProxy', t => {
    const proxy = new Proxy();
    t.equal(Object.prototype.toString.call(proxy), '[object PodiumProxy]');
    t.end();
});

test('.register() - no value given to "manifest" argument - should throw', t => {
    t.plan(1);
    const proxy = new Proxy();
    t.throws(() => {
        proxy.register(); // eslint-disable-line no-unused-vars
    }, /The value for the required argument "manifest" is not defined or not valid./);
    t.end();
});

test('.register() - invalid value given to "manifest" argument - should throw', t => {
    t.plan(1);
    const proxy = new Proxy();
    t.throws(() => {
        proxy.register({ foo: 'bar', name: 'æøå - tada' }); // eslint-disable-line no-unused-vars
    }, /The value for the required argument "manifest" is not defined or not valid./);
    t.end();
});

test('.register() - valid value given to "manifest" argument - should set value in internal registry', t => {
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
    t.equal(result[0][0], 'bar');
    t.end();
});
