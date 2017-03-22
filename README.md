# @podium/express-resource-proxy


```js

    const ResourceProxy = require('@podium/express-resource-proxy');
    const PodiumClient = require('@podium/client');

    const resources = new ResourceProxy({
        serverId: 'frontpage-layout-server', // app-name
        clients: [
            new PodiumClient(/*...*/),
            new PodiumClient(/*...*/),
        ],
    });

    app.use(resources.middleware());


```
