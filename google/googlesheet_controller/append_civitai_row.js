const authorize = require('../googleAuth');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const config = require("../../config/config.json");

exports.append_civitai_row = async (sheetName, loraFileName, infoBlock, currentUrl, imagesString) => {
    try {
        const authClient = await authorize();

        const sheetData = {
            values: [
                [loraFileName, infoBlock, currentUrl, "EMPTY", `<-${imagesString}->`]
            ],
        };

        const request = {
            // The ID of the spreadsheet to update.
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID,  // TODO: Update placeholder value.
            // The A1 notation of a range to search for a logical table of data.
            // Values are appended after the last row of the table.
            range: `${sheetName}!A:E`,  // TODO: Update placeholder value.
            // How the input data should be interpreted.
            valueInputOption: 'RAW',  // TODO: Update placeholder value.
            // How the input data should be inserted.
            insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.
            resource: sheetData,
            auth: authClient,
        };

        //Insert into google sheet
        const google_response = (await sheets.spreadsheets.values.append(request)).data;
        return google_response
    } catch (error) {
        console.error('Error appending row:', error);
        throw new Error("GoogleSheet Error")
    }
}