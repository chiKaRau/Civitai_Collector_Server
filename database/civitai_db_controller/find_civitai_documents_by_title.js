const mongoose = require("mongoose");
const CivitaiModel = require("../schema/civitai");
const authorize = require('../../google/googleAuth');

//This only remove latest document to prevent accidently remove files
exports.find_civitai_documents_by_title = async (sheetName, title) => {
    try {
        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        const CollectionModel = civitaiDB.model(sheetName, CivitaiModel.schema, sheetName);

        const regex = new RegExp(title, 'i'); // 'i' flag makes the match case-insensitive

        // Use the "title" variable in the query to find documents that include the specified title
        const matchingDocuments = await CollectionModel.find({
            $or: [
                { name: regex },
                { url: regex }
            ]
        });

        return matchingDocuments

    } catch (error) {
        console.error('Error remove document:', error);
        throw new Error("Mongodb Error")
    }
};