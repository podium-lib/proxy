import tap from 'tap';
import Proxy from '../lib/proxy.js';

tap.test('Proxy() - object tag - should be PodiumProxy', (t) => {
    const proxy = new Proxy();
    t.equal(Object.prototype.toString.call(proxy), '[object PodiumProxy]');
    t.end();
});

tap.test('.register() - no value given to "name" argument - should throw', (t) => {
    t.plan(1);
    const proxy = new Proxy();
    t.throws(() => {
        proxy.register();
    }, /The value for the required argument "name" is not defined or not valid./);
    t.end();
});

tap.test('.register() - invalid value given to "name" argument - should throw', (t) => {
    t.plan(1);
    const proxy = new Proxy();
    t.throws(() => {
        proxy.register('æøå - tada');
    }, /The value for the required argument "name" is not defined or not valid./);
    t.end();
});

tap.test('.register() - no value given to "manifest" argument - should throw', (t) => {
    t.plan(1);
    const proxy = new Proxy();
    t.throws(() => {
        proxy.register('local-podlet-name');
    }, /The value for the required argument "manifest" is not defined or not valid./);
    t.end();
});

tap.test('.register() - invalid value given to "manifest" argument - should throw', (t) => {
    t.plan(1);
    const proxy = new Proxy();
    t.throws(() => {
        proxy.register('local-podlet-name', { foo: 'bar', name: 'æøå - tada' });
    }, /The value for the required argument "manifest" is not defined or not valid./);
    t.end();
});
