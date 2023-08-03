const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const CivitaiScheme = new Schema(
    {
        _id: { type: ObjectId },
        name: { type: String, default: "" },
        info: { type: String, default: "" },
        images: { type: [], default: [] },
        url: { type: String, default: "" },
        row_id: { type: Number, default: 0}
    },
    {
        versionKey: false,
        timestamps: true
    }
);

let CivitaiModel = mongoose.model(
    "civitai",
    CivitaiScheme,
    "civitai"
);

module.exports = CivitaiModel;