const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const config = require("../../config/config.json");

const AdminConfigScheme = new Schema(
    {
        _id: { type: Number },
        db_ports: { type: Array, default: [] },
        db_names: { type: Array, default: [] },
        db_connection_urls: { type: Array, default: [] }
    }
);

let AdminConfigModel = mongoose.model(
    config.env_db.collection_name,
    AdminConfigScheme,
    config.env_db.collection_name
);

module.exports = AdminConfigModel;