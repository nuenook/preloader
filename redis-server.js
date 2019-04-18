
const redis = require('redis')
const redisClient = redis.createClient("3002", "13.67.70.169")
let redisOnline = false
redisClient.on('connect', function() {
    console.log('Redis client connected');
    redisOnline = true
});

redisClient.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

module.exports = {
    requestReceived: function (req, res, next) {
        //
        if (req.method !== 'GET' || !redisOnline) {
            return next();
        }

        redisClient.get(req.prerender.url, function (error, result) {
            if (!error && result) {
                console.log(result)
                req.prerender.cacheHit = true;
                console.log(req.prerender)
                var response = JSON.parse(result);

                res.send(response.statusCode, response);
            } else {
                next();
            }
        });
    },
    beforeSend: function(req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {    
            redisClient.set(req.prerender.url, JSON.stringify(req.prerender.content), function (error, reply) {
                console.log(error, reply)
            })
		}
		next();
	},
    pageLoaded: function (req, res, next) {
        if (!redisOnline) {
            return next();
        }

        var key = req.prerender.url;
        var response = {
            statusCode: req.prerender.statusCode,
            content: req.prerender.content.toString(),
            headers: req.prerender.headers
        };
        redisClient.set(key, JSON.stringify(response), function (error, reply) {
            // If library set to cache set an expiry on the key.
            if (!error && reply && TTL) {
                redisClient.expire(key, TTL, function (error, didSetExpiry) {
                    if (!error && !didSetExpiry) {
                        console.warn('Could not set expiry for "' + key + '"');
                    }
                });
            }
        });

        next();
    }
};