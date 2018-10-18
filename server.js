var express = require('express');        // call express
var bodyParser = require('body-parser');
var winston = require('./config/winston');
var Config = require('./config/config'),
    config = new Config();

// Auth0
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var fs = require('fs');
var server = express();

var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://regularswitch.auth0.com/.well-known/jwks.json"
    }),
    audience: 'https://regularswitch.com',
    issuer: "https://regularswitch.auth0.com/",
    algorithms: ['RS256']
});

server.use(jwtCheck);

server.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({message: 'Missing or invalid token'});
    }
});


// ROUTES
require('./config/express')(server);
server.get('/authorized', function (req, res) {
    res.send('Secured Resource');
});

// console.log(process.env.NODE_ENV);
// console.log(config);


// if(process.env.NODE_ENV == 'production') {
//     // HTTPS

//     var https = require('https');
//     var privateKey  = fs.readFileSync('/etc/nginx/ssl/privkey.pem');
//     var certificate = fs.readFileSync('/etc/nginx/ssl/cert.pem');
//     var credentials = {key: privateKey, cert: certificate};

//     var httpsServer = https.createServer(credentials, server);

//     httpsServer.listen(8543);

// } else {
    // ONLY HTTP
const PORT = process.env.PORT || 5000;
// }
server.listen(PORT, () => winston.info(`Listening on ${ PORT }`));



// End

winston.info('Server is running');
exports = module.exports = server;
