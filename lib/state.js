'use strict';

const originalUrl = require('original-url');
const { URL } = require('url');

const PodiumState = class PodiumState {
    constructor(request = {}, response = {}, view = '') {
        Object.defineProperty(this, 'request', {
            value: request,
        });

        Object.defineProperty(this, 'response', {
            value: response,
        });

        const url = originalUrl(request);
        Object.defineProperty(this, 'url', {
            value: url.full ? new URL(url.full) : {},
        });

        Object.defineProperty(this, 'view', {
            value: view,
        });

        Object.defineProperty(this, 'context', {
            enumerable: true,
            writable: true,
            value: {},
        });

        Object.defineProperty(this, 'development', {
            enumerable: true,
            writable: true,
            value: false,
        });

        Object.defineProperty(this, 'name', {
            enumerable: true,
            writable: true,
            value: '',
        });

        Object.defineProperty(this, 'css', {
            enumerable: true,
            writable: true,
            value: '',
        });

        Object.defineProperty(this, 'js', {
            enumerable: true,
            writable: true,
            value: '',
        });
    }

    get [Symbol.toStringTag]() {
        return 'PodiumState';
    }

    getRequest() {
        return this.request;
    }

    getResponse() {
        return this.response;
    }

    render(fragment) {
        if (this.development) {
            return this.view(fragment, this);
        }
        return fragment;
    }
};

module.exports = PodiumState;
