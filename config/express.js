'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var winston = require('./winston');
var config = require('./config_OLD');
var fs = require('fs');

module.exports = function(app) {

    winston.info('Initializing Express');

    // request body parsing middleware should be above methodOverride
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.use(function(req,res,next){
        res.setHeader('Access-Control-Allow-Origin','*');
        res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
        res.setHeader('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, id, Authorization, x-access-token, username, password");
        next();
    });

    require("../app/routes/wordpress.js")(app);

};
