//imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');
const logger = require('morgan');
const app = express();

const inputFile = 'folder_list.txt';
const outputFile = 'folder_list.json';

const { convertAndWriteFile, errorResponseSetter } = require('./utils/utils.js');

const { call_admin_db_config } = require("./database/admin_db_controller/call_admin_db_config.js")
const civitai_controller = require("./database/civitai_db_controller/civitai_db_controller.js");

//Uses
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//enable CORS from client-side
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

//setting up basic middleware for all Express requests
app.use(logger('dev')); // Log requests to API using morgan

app.get('/', (req, res) => {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }); + '</small>'
  res.status(200).send(responseText)
});

// Define a route for the callback URL
app.get('/callback', (req, res) => {
  var responseText = 'Hello World!<br>'
  responseText += '<small>Requested at: ' + new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }); + '</small>'
  res.status(200).send(responseText)
});

const router = require("./router");
router(app);

// Define error handling middleware
const errorHandlerMiddleware = (err, req, res, next) => {
  // Log the error or perform any error tracking/logging operations

  // Set an appropriate HTTP status code for the error
  res.status(err.status || 500);

  // Create an error response object
  const errorResponse = errorResponseSetter(err);

  // Send the error response to the client
  res.json(errorResponse);
};
app.use(errorHandlerMiddleware);

async function start() {

  try {
    //Open Connection for Admin and retriving the Config info
    //let { db_connection_urls, db_ports, db_names } = await call_admin_db_config()

    //Open Connection for civitai
    //Replace db_connection_urls[0].civitaiService with your mongodb connection url 
    //Replace db_names[0].civitaiService with your mongodb database
    await civitai_controller.call_civitai_db(db_connection_urls[0].civitaiService, db_names[0].civitaiService)
    //await civitai_controller.init_civitai_db_collection("Characters")
    //await civitai_controller.init_civitai_db_all_collections()
    //await civitai_controller.find_last_appended_civitai_documents()

    await convertAndWriteFile(inputFile, outputFile);
    app.listen(3000, () => console.log('Server is running on port ' + 3000));

  } catch (e) {
    console.log(e)
    console.log("Fail to retrieve config data.")
  }
}

start()
