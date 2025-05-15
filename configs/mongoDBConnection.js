const mongoose = require('mongoose');
const { logger } = require("./winston");

exports.connect = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.DB_CONNECTION);
        logger.info('Successfully connected to mongoDB');
    } catch (error) {
        logger.error(`Error: ${error.message}\nStack: ${error.stack}`);
    }
}