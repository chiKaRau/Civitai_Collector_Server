const authorize = require('../googleAuth');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const config = require("../../config/config.json");

exports.remove_civitai_row = async (sheetName, loraFileName, url) => {
    try {
        const authClient = await authorize();

        // Get the list of sheets in the spreadsheet.
        const { data } = await sheets.spreadsheets.get({
            auth: authClient,
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID,
        });

        let sheetsList = data.sheets

        // Find the sheet with the specified name.
        const sheet = sheetsList.find(sheet => sheet.properties.title === sheetName);

        if (!sheet) {
            throw new Error("")
        }

        const sheetId = sheet.properties.sheetId;

        // Get the values and their corresponding row indices from the specified sheet.
        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID,
            range: `${sheetName}!C:C`, // Fetch the values from the first column (you can adjust this to the desired column).
        });

        const values = response.data.values;

        if (!values || values.length === 0) {
            console.log('No data found in the sheet.');
            throw new Error("GoogleSheet Error")
        }

        // Calculate the last row index.
        const rowIndex = values.flat().indexOf(url);
        const rowValue = values.flat()[rowIndex]; // Get the value from the last row, column C.

        if (url === rowValue) {

            // Use the `deleteDimension` method to remove the last row.
            await sheets.spreadsheets.batchUpdate({
                auth: authClient,
                spreadsheetId: config.env_googlesheet.SPREADSHEETS_ID,
                requestBody: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId,
                                    dimension: 'ROWS',
                                    startIndex: rowIndex, // Convert to 0-based index.
                                    endIndex: rowIndex + 1, // Include the last row to be deleted.
                                },
                            },
                        },
                    ],
                },
            });

            console.log('Last row removed successfully.');
        } else {
            console.log('row does not match. The row will not be removed.');
            throw new Error("GoogleSheet Error")
        }
    } catch (error) {
        console.error('Error removing row:', error);
        throw new Error("GoogleSheet Error")
    }
}