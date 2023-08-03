const { connect } = require("../mongodb_connect");
const mongoose = require("mongoose");

exports.call_civitai_db = function (civitai_db_connection_urls, civitai_db_names) {
    try {
        return connect(
            civitai_db_connection_urls,
            civitai_db_names
        ).then(() => {
            console.log(`Connected to ${civitai_db_names}`);
        })
    } catch (err) {
        err.name = "mongodbError" // Add the 'type' property to the 'err' object
        next(err); // Pass the custom error to the error handling middleware
    }
};

