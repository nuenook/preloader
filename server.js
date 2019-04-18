#!/usr/bin/env node
var prerender = require('./lib');

var server = prerender({
    logRequests: true,
    chromeLocation: '/usr/bin/google-chrome',
    

});

server.use(prerender.sendPrerenderHeader());
// server.use(prerender.blockResources());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
