const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, printf, colorize, align, json } = winston.format;


const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({
                    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
                }),
                align(),
                printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
            )
        }),
        new DailyRotateFile({
            filename: 'logs/error/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,          // Archive old logs into .gz format
            maxSize: '20m',               // Max size for each log file before rotating
            maxFiles: '14d',
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                json()
            )
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                json()
            )
        }),
    ],
});



module.exports = {
    logger
}