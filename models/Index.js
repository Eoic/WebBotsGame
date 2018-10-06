const mongoose = require('mongoose');

/**
 * Connect to MongoDb server using Mongoose instance
 * @param {String} uri MongoDB connection string 
 */
const connect = (uri) => {

    mongoose.connect(uri, {
        useNewUrlParser: true,
        promiseLibrary: global.Promise
    });

    mongoose.connection.on('open', () => {
        console.log('Connected to MongoDB server.');
    });

    mongoose.connection.on('error', (err) => {
        chalk(`Failed to connect: ${err}`);
    });
};

module.exports = connect;