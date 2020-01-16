# @podium/proxy

Transparent HTTP proxy. Dynamically mounts proxy targets on an existing HTTP
server instance.

[![Dependencies](https://img.shields.io/david/podium-lib/proxy.svg)](https://david-dm.org/podium-lib/client)
![GitHub Actions status](https://github.com/podium-lib/proxy/workflows/Run%20Lint%20and%20Tests/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/podium-lib/proxy/badge.svg?targetFile=package.json&style=flat-square)](https://snyk.io/test/github/podium-lib/proxy?targetFile=package.json)

This module is intended for internal use in Podium and is not a module an end
user would use directly. End users will typically interact with this module
through higher level modules such as the [@podium/layout] and [@podium/podlet]
modules.

## Installation

```bash
$ npm install @podium/proxy
```

## Simple usage

Attach a proxy target to an HTTP server.

```js
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('@podium/proxy');
const http = require('http');

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

// Attach proxy to http server
const app = http.createServer(async (req, res) => {
    const incoming = new HttpIncoming(req, res);
    const result = await proxy.process(incoming);

    // The proxy did return "undefined" so nothing matched our proxy
    if (!result) {
        res.statusCode = 404;
        res.end('404 - Not found');
    }
});

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

-   `pathname` - {String} - Pathname to the root of where the proxy is to be mounted. Default: `/`.
-   `prefix` - {String} - Prefix used to namespace the proxy so its isolated from other routes in a HTTP server. Appended after pathname. Default: `podium-resource`.
-   `timeout` - {Number} - Default value, in milliseconds, for how long a request should wait before the connection is terminated. Default: 6000
-   `maxAge` - {Number} - Default value, in milliseconds, for how long manifests should be cached. Default: Infinity
-   `agent` - {HTTPAgent} - Default HTTP Agent used for all requests.
-   `logger` - {Object} - A logger which conforms to the log4j interface. See the docs for [abstract logger](https://www.npmjs.com/package/abslog) for more information.

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

A Podium manifest where the `proxy` property is given. The `proxy` property is
an object where the `key` identifies the target and the `property` is a URI to
the target.

### .process(HttpIncoming)

Metod for processing a incoming HTTP request. Matches the request against the
registered routing targets and proxies the request if a match is found.

Returns a promise. When resolving the passed in [HttpIncoming] object will be
returned.

If the inbound request matches a proxy endpoint and a proxy request was
successfully performed, the `.proxy` property on the returned [HttpIncoming]
object will be `true`. If the inbound request did not yeld a proxy request, the
`.proxy` property on the returned [HttpIncoming]  object will be `false`.

The method takes the following arguments:

#### HttpIncoming (required)

An instance of an [HttpIncoming] class.

```js
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('@podium/proxy');
const http = require('http');

const proxy = new Proxy();

proxy.register({ ...[snip]... });

const app = http.createServer(async (req, res) => {
    const incoming = new HttpIncoming(req, res);
    const result = await proxy.process(incoming);

    if (result.proxy) return;

    res.statusCode = 404;
    res.end('404 - Not found');
});
```

### .metrics

Property that exposes a metric stream.

Exposes a single metric called `podium_proxy_request` which includes `podlet`
and `proxy` meta fields.

Please see the [@metrics/client](https://www.npmjs.com/package/@metrics/client)
module for full documentation.

### .dump()

Returns an Array of all loaded manifests ready to be used by `.load()`.

### .load()

Loads an Array of manifests (provided by `.dump()`) into the proxy. If any of
the items in the loaded Array contains a key which is already in the cache, the
entry in the cache will be overwritten.

If any of the entries in the loaded Array are not compatible with the format
which `.dump()` exports, they will not be inserted into the cache.

Returns an Array with the keys which were inserted into the cache.

## Where are proxy targets mounted?

To be able to have multiple proxy targets in an HTTP server we need to make sure
that they do not collide with each other. To prevent this, each proxy target
defined is mounted on its own separate namespace in an HTTP server.

The convention for these namespaces is as follow:

`{pathname}/{prefix}/{podletName}/{proxyName}/`

-   pathname - Defined by the `pathname` argument in the constructor. Defaults to `/`.
-   prefix - Defined by `prefix` argument in the constructor. Defaults to `podium-resource`.
-   podletName - Defined by the `name` value in the manifest. Note: When the proxy module subscribes to receive manifest updates from the Podium Client, this name will be the name a Podlet is registered with in the Podium Client.
-   proxyName - Defined by the `proxy.name` property defined in the manifest.

### Example I

If one has the following manifest defined in an express server:

```js
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('@podium/proxy');
const http = require('http');

const proxy = new Proxy();

proxy.register({
    name: 'bar',
    proxy: {
        api: 'http://www.external.com/some/path',
    },
    version: '1.0.0',
    content: '/index.html',
});

const app = http.createServer(async (req, res) => {
    ...[snip]...
});

app.listen(8000);
```

The following proxy targets will be mounted:

-   http://localhost:8000/podium-resource/bar/api/

### Example II

If one has the following manifest and overrides the `prefix` on the constructor:

```js
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('@podium/proxy');
const http = require('http');

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

const app = http.createServer(async (req, res) => {
    ...[snip]...
});

app.listen(8000);
```

The following proxy targets will be mounted:

-   http://localhost:8000/my-proxy/bar/api/

### Example III

If one has the following manifest defined in an express server:

```js
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('@podium/proxy');
const http = require('http');

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

const app = http.createServer(async (req, res) => {
    ...[snip]...
});

app.listen(8000);
```

The following proxy targets will be mounted:

-   http://localhost:8000/podium-resource/bar/api/
-   http://localhost:8000/podium-resource/bar/feed/

### Example IV

If one has the following manifests defined in an express server:

```js
const { HttpIncoming } = require('@podium/utils');
const Proxy = require('@podium/proxy');
const http = require('http');

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

const app = http.createServer(async (req, res) => {
    ...[snip]...
});

app.listen(8000);
```

The following proxy targets will be mounted:

-   http://localhost:8000/podium-resource/bar/api/
-   http://localhost:8000/podium-resource/bar/feed/
-   http://localhost:8000/podium-resource/foo/users/

## License

Copyright (c) 2019 FINN.no

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



[@podium/layout]: https://github.com/podium-lib/layout "@podium/layout"
[@podium/podlet]: https://github.com/podium-lib/podlet "@podium/podlet"
[HttpIncoming]: https://github.com/podium-lib/utils/blob/master/lib/http-incoming.js "HttpIncoming"
