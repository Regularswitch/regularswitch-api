module.exports = function(WP_URL) {
    var module = {};
    var winston = require('../../../config/winston');
    var request = require('request');
    var http = require('http');

    var WP_AUTH = '/jwt-auth/v1/token';
    var WP_AUTH_VALID = '/jwt-auth/v1/token/validate';

    /*
     *
     * WP Authentication related routes
     *
     */

    module.getAuth = function (req, res) {
        winston.info(req.header('username'));
        winston.info(req.header('password'));
        request({
            uri: WP_URL + WP_AUTH,
            method: 'POST',
            form: {
                username: req.header('username'),
                password: req.header('password')
            }

        }, function(error, response, body) {
            res.json(JSON.parse(body));
        });

    };
    
    module.isAuthValid = function (req, res) {
        request({
            headers: {
                "Authorization" : "Bearer " + req.header('x-access-token'),
                "Content-Type": "application/json"
            },
            url: WP_URL + WP_AUTH_VALID,
            method: 'POST'

        }, function(error, response, body) {
            res.json(JSON.parse(body));
        });
    };

    return module;
};
