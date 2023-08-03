# Civitai Collector Server

![build](https://github.com/chibat/chrome-extension-typescript-starter/workflows/build/badge.svg)

Civitai Collector is a Chrome extension built using TypeScript and Visual Studio Code.

## Prerequisites

* * [node + npm](https://nodejs.org/) (Current Version) 

## Setup

To get started with Civitai Collector Server, follow these steps:

1. Setup Googlesheet Auth
    A. [Node.js qucikstart](https://developers.google.com/sheets/api/quickstart/nodejs)
    B. Complete (Enable the API)
    C. Complete (Configure the OAuth consent screen) (You can obtain your APIKey at here)
    D. Complete (Authorize credientails for a desktop application) (place the credientails.json in the /google directory )
    E. Setup the sample. Once your setup complete, you will obtain a token.json. Place it in the /google directory
    F. Create a Spreadsheet, then create any tables and you can obtain your spreadsheetID from the url (https://docs.google.com/spreadsheets/d/spreadsheetId/edit#gid=0)
    G. Copy your APIkey and Spreadsheet ID, and paste into /config/config.json

2. Setup Mongodb
    A. [MongoDB] (https://www.mongodb.com/)
    B. Create a cluster, and complete the security setup
    C. Go to the CivitaiCollector_Server folder, index.js Line 75 and replace db_connection_urls[0].civitaiService with your mongodb connection url and replace db_names[0].civitaiService with your mongodb database. Then run 
    ```
    node index.js
    ```

    D. Uncomment index.js Line 77 (//await civitai_controller.init_civitai_db_all_collections()), This will create MongoDB Collection based on your Google Spreadsheet table. (Remember to comment again after the collection are created.)

3. Setup folder_list.json
    A. At your saving model directory, running the following commands 
    ```
    mkdir "Drive Folder List"
    ```
    ```
    find . -type d ! -path "./Drive Folder List" -exec bash -c 'mkdir -p "Drive Folder List/${1#./}"' _ {} \;
    ```
    This will create empty folders by the your saving model directory in the "Drive Folder List".

    B. Create a folder_list.txt based on the folders
    ```
    find . -type d > folder_list.txt
    ```

    C. Place the folder_list.txt in the CivitaiCollector_server diretory

## Usage

Civitai Collector Server Peform the following functions:

1. Download the model and Zip it based on the folder path input

2. Appending, Updating, Deleting, Querying your model Infomartion from/in the googlesheet/mongodb

## License

This project is licensed under the [MIT License](./LICENSE). You are free to modify, distribute, and use the code as long as you adhere to the terms of the license.

## Contributing

Contributions are welcome! If you would like to contribute to the project, please follow the guidelines in the [CONTRIBUTING.md](./CONTRIBUTING.md) file.

