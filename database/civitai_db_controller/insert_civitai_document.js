const mongoose = require("mongoose");
const CivitaiModel = require("../schema/civitai");

//connect - reuse single connection through mongodo
//createConnection - create seperate connection 
//Since will only connect to civitai collection, so we only need use connect, and we don't close(disconnect) so we can reuse it 

//create civitai database
exports.insert_civitai_document = async (sheetName, row_id, data) => {
    try {
        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        const CollectionModel = civitaiDB.model(sheetName, CivitaiModel.schema, sheetName);

        const document = new CollectionModel({
            _id: mongoose.Types.ObjectId(),
            name: data.name,
            info: data.info,
            url: data.url,
            images: data.images,
            row_id: row_id
        })
        await document.save();
        console.log(`Created document with row_id #${row_id + 1} in collection '${sheetName}'`);
    } catch (error) {
        console.error('Error insert document:', error);
        throw new Error("Mongodb Error")
    }


};