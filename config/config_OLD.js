'use strict';

var nconf = require('nconf'),
    json5 = require('json5'),
    _ = require('lodash'),
    glob = require('glob'),
    fs = require('fs'),
    StandardError = require('standard-error'),
    winston = require('./winston');

var rootPath = __dirname + "/..";
// Load app configuration
var computedConfig = {
    root: rootPath,
    modelsDir: rootPath + '/app/models'
};


//
// Setup nconf to use (in-order):
//   1. Locally computed config
//   2. Command-line arguments
//   3. Some Environment variables
//   4. Some defaults
//   5. Environment specific config file located at './env/<NODE_ENV>.json'
//   6. Shared config file located at './env/all.json'
//




/**
 * Get files by glob patterns
 */
module.exports.getGlobbedFiles = function(globPatterns, removeRoot) {
    // For context switching
    var _this = this;

    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

    // The output array
    var output = [];

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
    if (_.isArray(globPatterns)) {
        globPatterns.forEach(function(globPattern) {
            output = _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
        });
    }
    else if (_.isString(globPatterns)) {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        }
        else {
            var files = glob(globPatterns, {
                sync: true
            });

            if (removeRoot) {
                files = files.map(function(file) {
                    return file.replace(removeRoot, '');
                });
            }

            output = _.union(output, files);
        }
    }

    return output;
};
