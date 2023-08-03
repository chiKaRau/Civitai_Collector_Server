const mongoose = require("mongoose");
const CivitaiModel = require("../schema/civitai");
const authorize = require('../../google/googleAuth');

//This only remove latest document to prevent accidently remove files
exports.remove_last_civitai_document = async (sheetName, loraFileName, row_id, url, removeLastest) => {
    try {
        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        const CollectionModel = civitaiDB.model(sheetName, CivitaiModel.schema, sheetName);

        let rowIdToDelete = row_id;

        if (removeLastest) {
            //find the max number for row_id
            const highestRowIdDocument = await CollectionModel.aggregate([
                { $group: { _id: null, maxRowId: { $max: "$row_id" } } }
            ]);

            rowIdToDelete = highestRowIdDocument.length > 0 ? highestRowIdDocument[0].maxRowId : 0;
        }

        const lastRowDocument = await CollectionModel.findOne({ row_id: rowIdToDelete });

        if (lastRowDocument.name === loraFileName) {

            const filterCondition = { $or: [{ row_id: rowIdToDelete }, { url: url }] };

            const deleteResult = await CollectionModel.deleteOne(filterCondition);

            if (deleteResult.deletedCount === 0) {
                console.log(`No document found for row_id ${rowIdToDelete}. Nothing to delete.`);
                throw new Error("MongoDB Error")
            } else {
                console.log(`Document with row_id ${rowIdToDelete} successfully deleted.`);
            }
        }
    } catch (error) {
        console.error('Error remove document:', error);
        throw new Error("Mongodb Error")
    }
};