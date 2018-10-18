'use strict';

/**
 * Created by Junaid Anwar on 5/28/15.
 */
var winston = require('winston');

const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const tsFormat = function() { new Date().toLocaleTimeString(); }

var logFile = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({
			level: 'info',
			prettyPrint: true,
			colorize: true,
			silent: false,
			timestamp: true
		}),
		new (require('winston-daily-rotate-file'))({
			filename: logDir+'/-infos.log',
			timestamp: tsFormat,
			datePattern: 'yyyy-MM-dd',
			prepend: true,
			level: env === 'development' ? 'verbose' : 'info'
		})
	]
});

module.exports = logFile;
