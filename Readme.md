# Civitai Collector Server (Developing)

![build](https://github.com/chibat/chrome-extension-typescript-starter/workflows/build/badge.svg)

Civitai Collector is a Chrome extension built using TypeScript and Visual Studio Code.

## Prerequisites

Before you begin, make sure you have the following prerequisites installed:

* [Node.js + npm](https://nodejs.org/) (Current Version)

## Setup

To get started with Civitai Collector Server, follow these steps:

1. **Setup Google Sheet Authentication:**
   - Follow the [Node.js quick start guide](https://developers.google.com/sheets/api/quickstart/nodejs) to enable the Google Sheets API and configure the OAuth consent screen.
   - Obtain your API Key and place it in the `/google` directory.
   - Authorize credentials for a desktop application and save the `credentials.json` file in the `/google` directory.
   - After completing the setup, you'll obtain a `token.json`. Place it in the `/google` directory.
   - Create a Spreadsheet and any desired tables. You can find your `SpreadsheetID` from the URL (https://docs.google.com/spreadsheets/d/spreadsheetId/edit#gid=0).
   - Copy your API Key and Spreadsheet ID and paste them into `/config/config.json`.

2. **Setup MongoDB:**
   - Setup [MongoDB](https://www.mongodb.com/) and create a cluster, completing the security setup.
   - Go to the `CivitaiCollector_Server` folder, edit `index.js` Line 75, and replace `db_connection_urls[0].civitaiService` with your MongoDB connection URL and `db_names[0].civitaiService` with your MongoDB database name.
   - Uncomment index.js Line 77 (`//await civitai_controller.init_civitai_db_all_collections()`). This will create MongoDB Collections based on your Google Sheets tables. 
   - Run the following command:
     ```
     node index.js
     ```
   - Remember to comment the index.js Line 77 out again after the collections are created.
3. **Setup `folder_list.json` for input autocomplete:**
   - At your saving model directory, run the following commands:
     ```
     mkdir "Drive Folder List"
     find . -type d ! -path "./Drive Folder List" -exec bash -c 'mkdir -p "Drive Folder List/${1#./}"' _ {} \;
     ```
   - This will create empty folders in the "Drive Folder List" based on your saving model directory.
   - Create a `folder_list.txt` based on the folders:
     ```
     find . -type d > folder_list.txt
     ```
   - Place the `folder_list.txt` in the `CivitaiCollector_server` directory.
   - The Civitai_Collector_Server will automatically generated a folder_list.json so you can use it at the Civitai_Collector_Client.

## Usage

Civitai Collector Server performs the following functions:

1. Download the model and zip it based on the folder path input so when you unzipping them, you don't need to spend time on organizing them into corresponding folder.
2. Append, Update, Delete, and Query your model information from/in Google Sheets and MongoDB.

## License

This project is licensed under the [MIT License](./LICENSE). You are free to modify, distribute, and use the code as long as you adhere to the terms of the license.

## Contributing

Contributions are welcome! If you would like to contribute to the project, please follow the guidelines in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.
