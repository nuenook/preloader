
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
                console.log("111111111", result)
                req.prerender.cacheHit = true;
                console.log("22222222", req.prerender)
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
                console.log("33333333", error, reply)
            })
		}
		next();
	}
};
