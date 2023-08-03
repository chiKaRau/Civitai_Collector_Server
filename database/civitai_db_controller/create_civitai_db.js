const { connect } = require("../mongodb_connect");
const mongoose = require("mongoose");
const config = require("../../config/config.json")
const axios = require('axios');

//create civitai database
exports.create_civitai_db = async () => {
    try {
        // Define your Google Sheets API endpoint
        const sheetEndpoint = `https://sheets.googleapis.com/v4/spreadsheets/${config.env_googlesheet.SPREADSHEETS_ID}?fields=sheets.properties.title&key=${config.env_googlesheet.APIKEY}`
        // Make a GET request to the Google Sheets API
        const response = await axios.get(sheetEndpoint);
        const collectionNames = response.data.sheets.map((sheet) => sheet.properties.title);

        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        // Iterate over the collection names
        for (const collectionName of collectionNames) {
            // Check if the collection already exists
            const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
            if (collections.length > 0) {
                console.log(`Collection '${collectionName}' already exists. Skipping...`);
                continue;
            }

            // Create the collection
            await civitaiDB.createCollection(collectionName);
            console.log(`Created collection '${collectionName}'`);
        }

        console.log('Database and collections created successfully');
    } catch (error) {
        console.error('Error create civitai database:', error);
        throw new Error("Mongodb Error")
    }

};