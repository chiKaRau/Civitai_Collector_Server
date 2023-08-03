const express = require("express");
const axios = require('axios');
const authorize = require('./google/googleAuth');
const { google } = require('googleapis');
const sheets = google.sheets('v4');
const fs = require('fs');
const request = require('request');
const path = require('path');
const archiver = require('archiver');
const ProgressBar = require('cli-progress');

const { readFile } = require('./utils/utils.js');

const config = require("./config/config.json");

const civitai_controller = require("./database/civitai_db_controller/civitai_db_controller.js");
const googlesheet_controller = require("./google/googlesheet_controller/googlesheet_controller")
const openai_controller = require("./openai/openai_controller/openai_controller")

module.exports = function (app) {
  // Initializing route groups
  const apiRoutes = express.Router();

  //GET Testing
  //API Route : /api/getData
  apiRoutes.get("/getData", (req, res, next) => {
    try {
      throw new Error("")
      /*
      res.send({
        data: "Using Get to retrieve datas"
      });
      */
    } catch (err) {
      err.name = "getDataError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/write-to-tables
  apiRoutes.post('/write-to-sheet', async (req, res, next) => {
    try {
      const sheetName = req.body.data.selectedSheet;
      let loraFileName = req.body.data.loraFileName
      let infoBlock = req.body.data.infoBlock
      let currentUrl = req.body.data.currentUrl
      let imagesArray = req.body.data.imagesArray

      let imagesString = `<p>${imagesArray
        .map((obj) => `<img src="${obj.url}" alt="Image">`)
        .join("\n")}</p>`


      //Append into Googlesheet
      const googlesheet_response = await googlesheet_controller.append_civitai_row(sheetName, loraFileName, infoBlock, currentUrl, imagesString)


      //Get the row_id from the googlesheet response
      let row_id_string = googlesheet_response.updates?.updatedRange;
      const regex = /(\d+)/;
      const match = row_id_string.match(regex);

      if (!match) {
        throw new Error("")
      }

      const row_id = parseInt(match[0], 10); // Convert to an integer

      //Insert into mongodb 
      const mongodb_response = await civitai_controller.insert_civitai_document(sheetName, row_id,
        { name: loraFileName, info: infoBlock, url: currentUrl, images: imagesArray })

      res.status(200).send("Success");
    } catch (err) {
      console.log(err)
      err.name = "writeToSheetError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  apiRoutes.post('/remove-from-sheet', async (req, res, next) => {
    try {
      const sheetName = req.body.data.selectedSheet;
      const loraFileName = req.body.data.loraFileName
      const url = req.body.data.url

      //Remove from GoogleSheet
      const googlesheet_response = await googlesheet_controller.remove_civitai_row(sheetName, loraFileName, url)

      //Remove from mongodb 
      const mongodb_response = await civitai_controller.remove_civitai_document(sheetName, loraFileName, url)

      res.status(200).send("Success");
    } catch (err) {
      console.log(err)
      err.name = "remove_from_sheetError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  apiRoutes.post('/update-sheet', async (req, res, next) => {
    try {
      const sheetName = req.body.data.selectedSheet;
      let loraFileName = req.body.data.loraFileName
      let infoBlock = req.body.data.infoBlock
      let currentUrl = req.body.data.currentUrl
      let imagesArray = req.body.data.imagesArray
      let docsUrl = req.body.data.docsUrl
      let oldLoraFileName = req.body.data.oldLoraFileName

      let imagesString = `<p>${imagesArray
        .map((obj) => `<img src="${obj.url}" alt="Image">`)
        .join("\n")}</p>`

      //update mongodb
      const googlesheet_response = await googlesheet_controller.update_civitai_row(sheetName, loraFileName, oldLoraFileName, infoBlock, currentUrl, docsUrl, imagesString)

      //update mongodb 
      const mongodb_response = await civitai_controller.update_civitai_document(sheetName,
        { loraFileName: loraFileName, oldLoraFileName: oldLoraFileName, infoBlock: infoBlock, currentUrl: currentUrl, docsUrl: docsUrl, imagesArray: imagesArray })

      res.status(200).send("Success");
    } catch (err) {
      console.log(err)
      err.name = "updateSheetError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });


  //API Route : /api/list-autocomplete
  apiRoutes.get('/list-autocomplete', async (req, res, next) => {
    try {
      //Read current directory Json ile
      readFile((jsonData) => {
        // Return the list of tables to the client
        res.status(200).send(jsonData);
      });
    } catch (err) {
      err.name = "listAutoCompleteError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/list-suggestionTags
  apiRoutes.post('/list-suggestionTags', async (req, res, next) => {
    try {
      const civitai_api = `https://civitai.com/api/v1/models/${req.body.data.modelID}`;
      const response = await axios.get(civitai_api);
      const { tags } = response.data;

      let suggestionTags = tags.map((tag) => {
        return { name: tag, value: tag };
      });
      res.status(200).send(suggestionTags)

    } catch (err) {
      err.name = "listSuggestionTagsError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/list-tables
  apiRoutes.get('/list-sheets', async (req, res, next) => {
    try {
      // Define your Google Sheets API endpoint
      const sheetEndpoint = `https://sheets.googleapis.com/v4/spreadsheets/${config.env_googlesheet.SPREADSHEETS_ID}?fields=sheets.properties.title&key=${config.env_googlesheet.APIKEY}`
      // Make a GET request to the Google Sheets API
      const response = await axios.get(sheetEndpoint);
      const tables = response.data.sheets.map((sheet) => sheet.properties.title);
      //console.log('Tables in the spreadsheet:', tables);
      // Return the list of tables to the client
      res.status(200).send(tables);
    } catch (err) {
      err.name = "listSheetsError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route: /api/download-file
  apiRoutes.post('/download-file', async (req, res, next) => {
    try {
      //Testing Use Case
      //localhost:3000/api/download-file
      //const fileUrl = 'https://civitai.com/api/download/models/109695';
      //const loraFileName = "testing"
      //const downloadPath =  '/@Scan@/letter/oreo/cofee/cookie/';
      //const loraFileExtension = "safesnor"; 

      const fileUrl = req.body.data.downloadurl;
      const loraFileName = req.body.data.loraFileName;
      const modelID = req.body.data.modelID
      const loraFileExtension = req.body.data.loraFileExtension || "safetensors";
      const fileName = `${loraFileName}.${loraFileExtension}`;
      const downloadPath = `/${modelID}_${loraFileName}${req.body.data.downloadFilePath}`; // /name/aaa/bbb/ccc/abc.safetensors

      // Create a temporary folder
      const tempFolder = path.join(__dirname, 'download');
      fs.mkdirSync(tempFolder, { recursive: true });

      // Create the directories based on the user input path
      const directories = downloadPath.split('/').filter(dir => dir !== '');
      let currentPath = tempFolder;
      directories.forEach(dir => {
        currentPath = path.join(currentPath, dir);
        fs.mkdirSync(currentPath, { recursive: true });
      });

      // Create a new progress bar instance
      const progressBar = new ProgressBar.Bar({}, ProgressBar.Presets.shades_classic);


      // Download the file into the last directory of the user input path
      const filePath = path.join(currentPath, fileName);
      const fileStream = fs.createWriteStream(filePath);

      //use request to download fileUrl and pass/store(pipe) the file into a writable stream
      request(fileUrl)
        .on('response', (res) => {
          const totalSize = parseInt(res.headers['content-length'], 10);
          progressBar.start(totalSize, 0);
        })
        .on('data', (chunk) => {
          progressBar.increment(chunk.length);
        })
        .pipe(fileStream);

      // Wait for the file to finish downloading
      fileStream.on('finish', () => {
        progressBar.stop();

        // Create a ZIP archive of the folder contents
        const zipPath = path.join(tempFolder, `${modelID}_${loraFileName}.zip`);
        const outputZip = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        outputZip.on('close', () => {
          // Log the file path
          //console.log('ZIP file path:', zipPath);

          const directoryToRemove = path.join(tempFolder, `${modelID}_${loraFileName}`);
          //console.log("REMOVE file path : ", directoryToRemove)
          fs.rmdirSync(directoryToRemove, { recursive: true });
          const boldText = `\x1b[1m${modelID}_${loraFileName}\x1b[0m`;
          console.log(`->          ${boldText} is download Complete!`);
        });

        archive.pipe(outputZip);

        let parentDirectory = ''; // Variable to store the parent directory name

        directories.forEach((dir, index) => {
          if (index === 0) {
            parentDirectory = dir; // Store the name of the first directory
            return; // Skip adding the first directory to the archive
          }
          const dirPath = path.join(tempFolder, dir);
          archive.directory(dirPath, dir);
        });

        archive.directory(path.join(tempFolder, parentDirectory), ''); // Add the parent directory without the name

        archive.finalize();
        res.sendStatus(200);
      });


      // Handle any errors during the download
      fileStream.on('error', (err) => {
        console.error('Download error:', err.message);
        progressBar.stop();
        res.status(500).json({
          message: 'Error downloading file',
        });
      });

    } catch (err) {
      console.log(err)
      err.name = "downloadFileError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });


  //API Route : /api/find-lora-by-modelID
  apiRoutes.post('/find-lora-by-modelID', async (req, res, next) => {
    try {
      let { sheetName, modelID } = req.body.data

      //update mongodb 
      const mongodb_response = await civitai_controller.find_civitai_documents_by_modelID(sheetName, modelID)

      let matchedDocs = mongodb_response.map((doc) => { return { name: doc.name, url: doc.url, images: doc.images, row_id: doc.row_id } })

      res.status(200).json(matchedDocs)
    } catch (err) {
      console.log(err)
      err.name = "findLoraError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/find-lora-by-modelID
  apiRoutes.post('/find-lora-by-url', async (req, res, next) => {
    try {
      let { sheetName, loraURL } = req.body.data

      //update mongodb 
      const mongodb_response = await civitai_controller.find_civitai_documents_by_url(sheetName, loraURL)

      let matchedDocs = mongodb_response.map((doc) => { return { name: doc.name, url: doc.url, images: doc.images, row_id: doc.row_id } })

      res.status(200).json(matchedDocs)
    } catch (err) {
      console.log(err)
      err.name = "findLoraError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/find-lora-by-title
  apiRoutes.post('/find-lora-by-title', async (req, res, next) => {
    try {
      let { sheetName, title } = req.body.data

      //update mongodb 
      const mongodb_response = await civitai_controller.find_civitai_documents_by_title(sheetName, title)

      let similarDocs = mongodb_response.map((doc) => { return { name: doc.name, url: doc.url, images: doc.images } })

      res.status(200).json(similarDocs)
    } catch (err) {
      console.log(err)
      err.name = "findLoraError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/find-lora-by-modelID
  apiRoutes.post('/find-lora-by-modelID', async (req, res, next) => {
    try {
      let { sheetName, modelID } = req.body.data

      //update mongodb 
      const mongodb_response = await civitai_controller.find_civitai_documents_by_modelID(sheetName, modelID)

      let matchedDocs = mongodb_response.map((doc) => { return { name: doc.name, url: doc.url, images: doc.images, row_id: doc.row_id } })

      res.status(200).json(matchedDocs)
    } catch (err) {
      console.log(err)
      err.name = "findLoraError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  //API Route : /api/find-lora-by-modelID
  apiRoutes.get('/find-last-appended-docs', async (req, res, next) => {
    try {
      //update mongodb 
      const mongodb_response = await civitai_controller.find_last_appended_civitai_documents()
      let lastAppendedDocs = mongodb_response.map((collection) => (
        {
          collectionName: collection.collectionName,
          documents: collection.documents
        }
      ))
      res.status(200).json(lastAppendedDocs)
    } catch (err) {
      console.log(err)
      err.name = "findLoraError" // Add the 'type' property to the 'err' object
      next(err); // Pass the custom error to the error handling middleware
    }
  });

  // Set url for API group routes
  app.use("/api", apiRoutes);
};