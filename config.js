'use strict';

try {
    require.resolve('envalid');
} catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
        throw new Error(
            'Envalid package not found, you need to install it to use the definitions.',
        );
    }

    throw e;
}

const { str } = require('envalid');
const zipkinConfig = require('@finn-no/zipkin/config');

module.exports = Object.assign({}, zipkinConfig, {
    BRAKES_GROUP: str({
        desc: 'The group assigned to the circuit',
        default: 'pipe-service',
    }),
    BRAKES_NAME: str({
        desc: 'The name assigned to the circuit',
        default: undefined,
    }),
    ZIPKIN_REMOTE_SERVICE_NAME: str({
        desc: 'The name assigned to the Zipkin instrumentation',
        default: undefined,
    }),
});
