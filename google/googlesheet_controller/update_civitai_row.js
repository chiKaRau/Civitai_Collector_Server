const authorize = require('../googleAuth');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const config = require("../../config/config.json");

exports.update_civitai_row = async (sheetName, loraFileName, oldLoraFileName, infoBlock, currentUrl, docsUrl, imagesString) => {
    try {
        const authClient = await authorize();

        const sheetData = {
            values: [
                [loraFileName, infoBlock, currentUrl, "EMPTY", imagesString]
            ],
        };

        const findRowRequest = {
            auth: authClient,
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID, // Replace with your spreadsheet ID
            range: `${sheetName}!C:C`, // Assuming the URLs are in column C
            valueRenderOption: 'UNFORMATTED_VALUE',
        };

        let rowNumberToUpdate = -1;

        const findRowResponse = await sheets.spreadsheets.values.get(findRowRequest);
        const rows = findRowResponse.data.values;
        if (rows && rows.length > 0) {
            rowNumberToUpdate = rows.findIndex((row) => row[0] === docsUrl);
        }

        if (rowNumberToUpdate === -1) {
            console.log(`Row with URL "${docsUrl}" not found.`);
            throw new Error("GoogleSheet Error")
        }

        // If the row is found, update the values in columns A, B, C for that row
        const updateData1 = {
            values: [
                [loraFileName, infoBlock, currentUrl, oldLoraFileName, `<-${imagesString}->`]
            ],
        };

        const updateRange1 = `${sheetName}!A${rowNumberToUpdate + 1}:E${rowNumberToUpdate + 1}`; // +1 to convert to 1-indexed row number

        const updateRequest1 = {
            auth: authClient,
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID, // Replace with your spreadsheet ID
            range: updateRange1,
            valueInputOption: 'RAW',
            resource: updateData1,
        };
        const updateResponse1 = await sheets.spreadsheets.values.update(updateRequest1);

        /*
        const updateData2 = {
            values: [
                [`<-${imagesString}->`]
            ],
        };
        const updateRange2 = `${sheetName}!E${rowNumberToUpdate + 1}`; // +1 to convert to 1-indexed row number
        const updateRequest2 = {
            auth: authClient,
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID, // Replace with your spreadsheet ID
            range: updateRange2,
            valueInputOption: 'RAW',
            resource: updateData2,
        };
        const updateResponse2 = await sheets.spreadsheets.values.update(updateRequest2);
        */

        console.log(`Row ${rowNumberToUpdate + 1} updated successfully.`);
    } catch (error) {
        console.error('Error updating row:', error);
        throw new Error("GoogleSheet Error")
    }

}