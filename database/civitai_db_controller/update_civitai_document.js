const mongoose = require("mongoose");
const CivitaiModel = require("../schema/civitai");
const authorize = require('../../google/googleAuth');

//create civitai database
exports.update_civitai_document = async (sheetName, data) => {
    try {
        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        const CollectionModel = civitaiDB.model(sheetName, CivitaiModel.schema, sheetName);

        const updatedocument = {
            url: data.currentUrl,
            name: data.loraFileName,
            info: data.infoBlock,
            images: data.imagesArray
        }

        const updateResult = await CollectionModel.updateOne(
            { url: data.docsUrl },
            updatedocument,
            { upsert: true, new: true }
        );

        if (updateResult.nModified === 0) {
            console.log(`No document found for ${data.docsUrl}`);
        } else {
            console.log(`Document updated successfully for ${data.docsUrl}`);
        }
    } catch (error) {
        console.error('Error update document:', error);
        throw new Error("Mongodb Error")
    }
};