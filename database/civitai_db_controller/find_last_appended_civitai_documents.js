const { connect } = require("../mongodb_connect");
const mongoose = require("mongoose");
const config = require("../../config/config.json")
const axios = require('axios');
const CivitaiModel = require("../schema/civitai");
const authorize = require('../../google/googleAuth');
const { google } = require('googleapis');
const sheets = google.sheets('v4');

//This will add and update the collection document (FOR INIT ONLY)
//For init only because the row_id is define from 0 

//create civitai database
exports.find_last_appended_civitai_documents = async () => {

    try {

        // Define your Google Sheets API endpoint
        const sheetEndpoint = `https://sheets.googleapis.com/v4/spreadsheets/${config.env_googlesheet.SPREADSHEETS_ID}?fields=sheets.properties.title&key=${config.env_googlesheet.APIKEY}`
        // Make a GET request to the Google Sheets API
        const sheetListResponse = await axios.get(sheetEndpoint);
        const collectionNames = sheetListResponse.data.sheets.map((sheet) => sheet.properties.title);

        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });
        const lastAppendedDocuments = [];
        for (let collectionName of collectionNames) {
            let collectionArray = []
            console.log(`Adding Docs into ${collectionName} Collection.`)
            const CollectionModel = civitaiDB.model(collectionName, CivitaiModel.schema, collectionName);
            const lastAppendedDocs = await CollectionModel.find({}).sort({ row_id: -1 }).limit(3).exec(); // Replace .toArray() with .exec()
            collectionArray.push(lastAppendedDocs)
            if (collectionName === "Testing") {
                console.log(collectionArray[0])
            }
            lastAppendedDocuments.push({
                collectionName, documents: collectionArray.flat().map((doc) => {
                    return {
                        name: doc.name,
                        images: doc.images,
                        url: doc.url,
                        row_id: doc.row_id
                    }
                })
            });
        }

        //console.log(lastAppendedDocuments[4])

        return lastAppendedDocuments

    } catch (error) {
        console.error('Error initalize collection:', error);
        throw new Error("Mongodb Error")
    }
};