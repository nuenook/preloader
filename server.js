#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender({
    logRequests: true,
});

server.use(prerender.sendPrerenderHeader());
// server.use(prerender.blockResources());
server.use(require('./redis-server'))
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
