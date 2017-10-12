'use strict';

module.exports.createLoginServiceClient = () => ({
    generateUserJwt(token) {
        return Promise.resolve(`jwt:${token}`);
    },
});
