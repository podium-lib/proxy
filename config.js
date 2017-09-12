'use strict';

try {
    require.resolve('envalid');
} catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
        throw new Error(
            'Envalid package not found, you need to install it to use the definitions.'
        );
    }

    throw e;
}

const pipeConfig = require('@finn-no/proxy-services/config');
const contextConfig = require('@podium/context/config');

module.exports = Object.assign({}, contextConfig, pipeConfig);
