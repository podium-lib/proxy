# @podium/proxy

[![Build Status](https://travis.schibsted.io/Podium/proxy.svg?token=qt273uGfEz64UyWuNHJ1&branch=master)](https://travis.schibsted.io/Podium/proxy)

Transparent http proxy. Dynamically mounts proxy targets on an existing HTTP server instance.

## Installation

```bash
$ npm install @podium/proxy
```

## Simple usage

Attach a proxy target to an existing Express server.

```js
const express = require('express');
const Proxy = require('@podium/proxy');

// Set up express server
const app = express();

// Set up proxy
const proxy = new Proxy();

// Register remote target(s) on separate namespace
proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
    },
    version: '1.0.0',
    content: '/bar',
});

// Attach proxy middleware
app.use(proxy.middleware());

// Start appserver where proxy is attached
app.listen(9999);
```

Proxy is now mounted on:
http://localhost:9999/podium-resource/bar/api

## Constructor

Create a new Proxy instance.

```js
const Proxy = require('@podium/proxy');
const proxy = new Proxy(options);
```

The constructor takes the following arguments:

### options (optional)

An options object containing configuration. The following values can be provided:

*   `pathname` - {String} - Pathname to the root of where the proxy is to be mounted. Default: `/`.
*   `prefix` - {String} - Prefix used to namespace the proxy so its isolated from other routes in a HTTP server. Appended after pathname. Default: `podium-resource`.
*   `timeout` - {Number} - Default value, in milliseconds, for how long a request should wait before the connection is terminated. Default: 6000
*   `maxAge` - {Number} - Default value, in milliseconds, for how long manifests should be cached. Default: Infinity
*   `agent` - {HTTPAgent} - Default HTTP Agent used for all requests.
*   `logger` - {Object} - A logger which conforms to the log4j interface. See the docs for [abstract logger](https://www.npmjs.com/package/abslog) for more information.

## API

The Proxy instance havs the following API:

### .register(manifest)

Registers proxy target(s) by providing a Podium manifest.

Example:

```js
const Proxy = require('@podium/proxy');

// Set up proxy
const proxy = new Proxy();

// Register remote target(s) on separate namespace
proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
    },
    version: '1.0.0',
    content: '/bar',
});
```

#### manifest (required)

A Podium manifest where the `proxy` property is given. The `proxy` property is an object where the `key` identifies the target and the `property` is a URI to the target.

### .middleware()

Middleware that mounts the proxy on a Connect middleware compatible
HTTP server.

### .dump()

Returns an Array of all loaded manifests ready to be used by `.load()`.

### .load()

Loads an Array of manifests (provided by `.dump()`) into the proxy. If any of the items in the loaded Array contains a key which is already in the cache, the entry in the cache will be overwritten.

If any of the entries in the loaded Array are not compatible with the format which `.dump()` exports, they will not be inserted into the cache.

Returns an Array with the keys which were inserted into the cache.

## Where are proxy targets mounted?

To be able to have multible proxy targets in an HTTP server we need to make sure that they do not collide with each other. To prevent so, each proxy target defined is mounted on their own separate namespace in an HTTP server.

The convention for these namespaces is as follow:

`{pathname}/{prefix}/{podletName}/{proxyName}/`

*   pathname - Defined by the `pathname` argument in the constructor. Defaults to `/`.
*   prefix - Defined by `prefix` argument in the constructor. Defaults to `podium-resource`.
*   podletName - Defined by the `name` value in the manifest. Note: When the proxy module subscribes to receive manifest updates from the Podium Client, this name will be the name a Podlet is registered with in the Podium Client.
*   proxyName - Defined by the `proxy.name` property defined in the manifest.

### Example I

If one has the following manifest defined in an express server:

```js
const app = require('express')();
const Proxy = require('@podium/proxy');
const proxy = new Proxy();

proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
    },
    version: '1.0.0',
    content: '/index.html',
});

app.use(proxy.middleware());

app.listen(8000);
```

The following proxy targets will be mounted:

*   http://localhost:8000/podium-resource/bar/api/

### Example II

If one has the following manifest and overrides the `prefix` on the constructor:

```js
const app = require('express')();
const Proxy = require('@podium/proxy');
const proxy = new Proxy({
    prefix: '/my-proxy',
});

proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
    },
    version: '1.0.0',
    content: '/index.html',
});

app.use(proxy.middleware());

app.listen(8000);
```

The following proxy targets will be mounted:

*   http://localhost:8000/my-proxy/bar/api/

### Example III

If one has the following manifest defined in an express server:

```js
const app = require('express')();
const Proxy = require('@podium/proxy');
const proxy = new Proxy();

proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
        feed: '/feed',
    },
    version: '1.0.0',
    content: '/index.html',
});

app.use(proxy.middleware());

app.listen(8000);
```

The following proxy targets will be mounted:

*   http://localhost:8000/podium-resource/bar/api/
*   http://localhost:8000/podium-resource/bar/feed/

### Example IV

If one has the following manifests defined in an express server:

```js
const app = require('express')();
const Proxy = require('@podium/proxy');
const proxy = new Proxy();

proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
        feed: '/feed',
    },
    version: '1.0.0',
    content: '/index.html',
});

proxy.register({
    name: 'foo',
    proxy: {
        users: 'http://www.anywhere.com/api',
    },
    version: '2.0.0',
    content: '/index.html',
});

app.use(proxy.middleware());

app.listen(8000);
```

The following proxy targets will be mounted:

*   http://localhost:8000/podium-resource/bar/api/
*   http://localhost:8000/podium-resource/bar/feed/
*   http://localhost:8000/podium-resource/foo/users/
