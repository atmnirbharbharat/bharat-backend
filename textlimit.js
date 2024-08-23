function getTextLimiter(textlimit){
    return (req, res, next) => {
        req.body = Object.keys(req.body).reduce((acc, curr) => {
            acc[curr] = req.body[curr].trim().slice(0,textlimit)
            console.log(acc[curr])
            return acc;
          }, {});
        next()
    }
}

module.exports = getTextLimiter