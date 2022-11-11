// Middleware function to add to the routes that we want to protect
const jwt = require('jsonwebtoken');

// TODO: send notification before logout

// ROUTE PROTECTION MIDDLEWARE
const requireAuth = (req, res, next) => {

    // grab the token from the cookie named authToken (we can do this thanks to cookie-parser)
    const token = req.cookies.authToken;

    // check if token exists and is valid
    // console.log(token);
    if(!token) {
        return res.send({status: false, route_status: 'Access denied'});
    }
       
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        // console.log(verified);
        req.user = verified;
       /* if successful, continue processing any remaining middleware after this one is done (otherwise no other routes will be processed at all) */
        next();
    } catch (error) {
        // status will be false if token is not stored or is invalid/expired
        res.send({status: false, route_status: 'Invalid credentials'});
    }
  
}

module.exports = {
    requireAuth
};