const requestIp = require('request-ip')

function getRateLimiter(ratelimit) {
    let ipholder = {}
    return (req, res, next) => {
        //get user ip
        const clientIp = requestIp.getClientIp(req)
        //if can't get the IP , move on
        if(clientip == null){
            next()
        }
        //if IP exist in map , cancel the request
        if (ipholder[clientIp]) {
            return res.status(401).send('Stop')
        } else {
            //store in map and forward the request
            ipholder[clientIp] = 1
            //remove from map after set seconds
            setTimeout(() => {
                delete ipholder[clientIp]
            }, ratelimit)
            next()
        }
    }
}

module.exports = getRateLimiter