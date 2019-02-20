"use strict";

const { HttpIncoming } = require('@podium/utils');
const Proxy = require("../");
const http = require('http');

// Dummy remote target servers
const remoteA = http.createServer((req, res) => {
    console.log("remote A server:", req.url);
    console.log("remote A server:", req.headers);
    console.log("remote A server:", req.query);
    setTimeout(() => {
        res.statusCode = 200;
        res.end('Remote A\n');
    }, 2000);
});
remoteA.listen(6001);

const remoteB = http.createServer((req, res) => {
    console.log("remote B server:", req.url);
    console.log("remote B server:", req.headers);
    console.log("remote B server:", req.query);
    res.statusCode = 200;
    res.end('Remote B\n');
});
remoteB.listen(6002);


// Set up proxy
const proxy = new Proxy({
    logger: console,
    pathname: "/my-layout/",
    prefix: "proxy"
});

// Register remote targets on their separate namespace
proxy.register({
    name: "foo",
    proxy: {
        a: "http://localhost:6001/",
        b: "http://localhost:6002/some/other/path"
    },
    version: "1.0.0",
    content: "/foo"
});
proxy.register({
    name: "bar",
    proxy: {
        b: "http://localhost:6002/some/path"
    },
    version: "1.0.0",
    content: "/bar"
});

const app = http.createServer(async (req, res) => {
    const incoming = new HttpIncoming(req, res);
    const result = await proxy.process(incoming);
    if (!result) {
        res.statusCode = 404;
        res.end('404 - Not found');
    }
});

// Start appserver where proxy is attached
app.listen(9999);

// GET example:
// curl http://localhost:9999/my-layout/proxy/foo/a/
// curl http://localhost:9999/my-layout/proxy/foo/b/
// curl http://localhost:9999/my-layout/proxy/bar/b/
// curl http://localhost:9999/my-layout/proxy/bar/b
// curl http://localhost:9999/my-layout/proxy/bar/b/?foo=bar
// curl http://localhost:9999/my-layout/proxy/bar/b?foo=bar

// POST example:
// curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X POST http://localhost:9999/my-layout/proxy/foo/b/

// DELETE example:
// curl -X DELETE http://localhost:9999/my-layout/proxy/foo/b/

// PUT example:
// curl -d '{"key1":"value1", "key2":"value2"}' -H "Content-Type: application/json" -X PUT http://localhost:9999/my-layout/proxy/foo/b/
