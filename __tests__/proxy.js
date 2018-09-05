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
