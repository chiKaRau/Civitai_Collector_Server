const mongoose = require("mongoose");
const CivitaiModel = require("../schema/civitai");
const authorize = require('../../google/googleAuth');

//This only remove latest document to prevent accidently remove files
exports.remove_civitai_document = async (sheetName, loraFileName, url) => {

    try {
        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        const CollectionModel = civitaiDB.model(sheetName, CivitaiModel.schema, sheetName);

        const rowDocument = await CollectionModel.findOne({ url: url }).sort({ row_id: -1 });

        if (rowDocument.name === loraFileName) {
            // Store the row_id of the document to be deleted
            const rowIdToDelete = rowDocument.row_id;

            const filterCondition = { url: url };

            // Delete the document with the matching URL
            const deleteResult = await CollectionModel.deleteOne(filterCondition);

            if (deleteResult.deletedCount === 0) {
                console.log(`No document found with URL ${url}. Nothing to delete.`);
                throw new Error("MongoDB Error");
            } else {
                console.log(`Document with URL ${url} successfully deleted.`);

                // Find all documents with row_id greater than the deleted document's row_id and update them
                await CollectionModel.updateMany(
                    { row_id: { $gt: rowIdToDelete } },
                    { $inc: { row_id: -1 } } // Decrement the row_id by 1
                );
            }
        }
    } catch (error) {
        console.error('Error remove document:', error);
        throw new Error("Mongodb Error");
    }
};