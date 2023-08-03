const { connect } = require("../mongodb_connect");
const AdminConfigModel = require("../schema/admin");
const mongoose = require("mongoose");
const config = require("../../config/config.json");

exports.call_admin_db_config = function () {
    try {
        return connect(
            config.env_db.db_connection_string,
            config.env_db.db_name
        ).then(() => {
            console.log(`Connected to ${config.env_db.db_name}`);

            return new Promise((resolve, reject) => {
                AdminConfigModel.findOne({ _id: 1 }, (err, result) => {
                    if (err) reject(err);
                    else if (!result) resolve(false);
                    else resolve(result);
                });
            })
        }).finally(() => {
            //Disconnect Admin Database connection after retrieving the another database data
            console.log(`${config.env_db.db_name} connection has closed.`);
            mongoose.connection.close();
        })
    } catch (err) {
        err.name = "mongodbError" // Add the 'type' property to the 'err' object
        next(err); // Pass the custom error to the error handling middleware
    }
};

