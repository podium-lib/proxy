# @podium/proxy

[![Build Status](https://travis.schibsted.io/Podium/proxy.svg?token=qt273uGfEz64UyWuNHJ1&branch=master)](https://travis.schibsted.io/Podium/proxy)

Transparent http proxy. Does dynamically mount proxy targets on a
existing http server instance.


## Installation

```bash
$ npm i @podium/proxy
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

The constructor take the following arguments:

### options (optional)

An options object containing configuration. The following values can be provided:

 * `timeout` - {Number} - Default value, in milliseconds, for how long a request should wait before connection is terminated. Default: 6000
 * `maxAge` - {Number} - Default value, in milliseconds, for how long manifests should be cached. Default: Infinity
 * `agent` - {HTTPAgent} - Default HTTP Agent used for all requests.
 * `logger` - {Object} - A logger which conform to a log4j interface. See the doc for the internal [abstract logger](https://www.npmjs.com/package/abslog) for more information.


## API

The Proxy instance have the following API:

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

A Podium manifest where the `proxy` property is given. The `proxy`
property is an object where the `key` identifies the target and the `property` is a URI to the target.


### .middleware(mountPathname)

Middleware that mounts the proxy on an Connect middleware compatible
http server.

The method takes the following arguments:

 * mountPathname - `String` - Path to mount the proxy under. Default: 'podium-resource'


### .dump()

Returns an Array of all loaded manifests ready to be used by `.load()`.

### .load()

Loads an Array of manifests, provided by `.dump()`, into the proxy. If any of
the items in the loaded Array contains a key which already are in the cache
the entry in the cache will be overwritten.

If any of the entries in the loaded Array are not compatible with the format
which `.dump()` exports, they will not be inserted into the cache.

Returns and Array with the keys which was inserted into the cache.






## A word on manifest to register proxys

TODO

## A word on route mounting

TODO

## A word on appending Podium context

TODO
