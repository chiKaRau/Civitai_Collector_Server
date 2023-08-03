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
exports.init_civitai_db_collection = async (sheetName) => {
    try {
        const authClient = await authorize();
        const request = {
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID, // TODO: Update placeholder value.
            ranges: [
                `${sheetName}!A:E`,
                // Add more ranges as needed
            ],
            majorDimension: 'ROWS',
            auth: authClient,
        };

        const response = await sheets.spreadsheets.values.batchGet(request);
        const valueRanges = response.data.valueRanges;
        const values = valueRanges[0].values;
        const dataArray = [];

        if (values && values.length > 0) {
            values.slice(1).forEach(row => dataArray.push(row));
        }

        // Create the civitai database if it doesn't exist
        const civitaiDB = mongoose.connection.useDb('civitai', { useCache: true });

        console.log('Number of Rows:', dataArray.length);


        const CollectionModel = civitaiDB.model(sheetName, CivitaiModel.schema, sheetName);

        // Check if the collection already exists
        const collectionExists = await mongoose.connection.db.listCollections({ name: sheetName }).hasNext();
        if (collectionExists) {
            console.log(`Collection '${sheetName}' already exists. Skipping creation...`);
        } else {
            await civitaiDB.createCollection(sheetName);
            console.log(`Created collection '${sheetName}'`);
        }

        for (const [index, row] of dataArray.entries()) {

            let imagesArray = []
            if (row[4] !== "" || row[4] !== "Error") {
                const regex = /<img\s+src="([^"]+)"/gi;
                for (const match of row[4].matchAll(regex)) {

                    let obj = {
                        url: match[1],
                        nsfw: "Soft",
                        width: 512,
                        height: 512
                    }

                    imagesArray.push(obj);
                }
            }

            const existingDocument = await CollectionModel.findOneAndUpdate(
                { row_id: index + 2 },
                {
                    name: row[0],
                    info: row[1],
                    url: row[2],
                    images: imagesArray
                },
                { upsert: true, new: true }
            );

            if (!existingDocument) {
                console.log(
                    `#${index + 2} / ${dataArray.length + 1} Created document in collection '${sheetName}'`
                );
            } else {
                console.log(
                    `#${index + 2} / ${dataArray.length + 1} Updated document in collection '${sheetName}'`
                );
            }
        }

        console.log('Documents created successfully');

    } catch (error) {
        console.error('Error initalize collection:', error);
        throw new Error("Mongodb Error")
    }
};