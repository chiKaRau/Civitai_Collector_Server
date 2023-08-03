const mongoose = require("mongoose");

exports.connect = (connectionUrl, databaseName) => {
    try {
        return mongoose
            .connect(
                connectionUrl,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    dbName: databaseName
                }
            )
            .then(() => {
                console.log(`Mongoose is connecting to ${databaseName} database`);
            })
    } catch (err) {
        err.name = "mongodbError" // Add the 'type' property to the 'err' object
        next(err); // Pass the custom error to the error handling middleware
    }
};