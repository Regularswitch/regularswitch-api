module.exports = function (server) {
    var winston = require('../../config/winston');
    var express = require('express');
    var Config = require('./../../config/config'),
    config = new Config();
    
    
    /**
     * RSW
     */
    var router = express.Router();
    var WP_URL = config.wordpress.url;

    /*
     * WP Generals routes
     *
     */
    var wpCtrl = require("../controllers/wordpress/wp.controller.js")(WP_URL, config.lang);
    router.get('/', wpCtrl.getWP);
    router.get('/pages', wpCtrl.getPages);
    router.get('/posts', wpCtrl.getPosts);
    router.get('/categories', wpCtrl.getCategories);


    /*
     * WP Authentication related routes
     *
     */
    var wpAuthCtrl = require("../controllers/wordpress/wp.auth.controller.js")(WP_URL);
    router.post('/auth', wpAuthCtrl.getAuth);
    router.post('/auth/validate', wpAuthCtrl.isAuthValid);


    server.use('/api/rsw/wp', router);

    /**
     * 7-Ciel
     */

    var router_7c = express.Router();
    var WP_URL_7C = config.wordpress.url_7c;


     /*
     * WP Generals routes
     *
     */
    var wpCtrl = require("../controllers/wordpress/wp.controller.js")(WP_URL_7C, config.lang_7c);
    router_7c.get('/', wpCtrl.getWP);
    router_7c.get('/pages', wpCtrl.getPages);
    router_7c.get('/posts', wpCtrl.getPosts);
    router_7c.get('/categories', wpCtrl.getCategories);


    /*
     * WP Authentication related routes
     *
     */
    var wpAuthCtrl = require("../controllers/wordpress/wp.auth.controller.js")(WP_URL_7C);
    router_7c.post('/auth', wpAuthCtrl.getAuth);
    router_7c.post('/auth/validate', wpAuthCtrl.isAuthValid);


    server.use('/api/7c/wp', router_7c);   
};
