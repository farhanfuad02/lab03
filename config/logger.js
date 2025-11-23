const winston = require('winston');
const path = require('path');

const logDir = 'logs';
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ],
});

module.exports = logger;
