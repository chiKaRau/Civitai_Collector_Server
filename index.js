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

/*
async function example() {
  // To use ESM in CommonJS, you can use a dynamic import like this:
  const { ChatGPTUnofficialProxyAPI } = await import('chatgpt')
  const { oraPromise } = await import('ora')

  // You can also try dynamic importing like this:
  // const importDynamic = new Function('modulePath', 'return import(modulePath)')
  // const { ChatGPTAPI } = await importDynamic('chatgpt')

  const api = new ChatGPTUnofficialProxyAPI({
    "accessToken":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJycmV4YXVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJodHRwczovL2FwaS5vcGVuYWkuY29tL2F1dGgiOnsidXNlcl9pZCI6InVzZXItRjNrcWt2NmpHR1RoeGJDMVBCaDJ0VTkyIn0sImlzcyI6Imh0dHBzOi8vYXV0aDAub3BlbmFpLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDExMDE0NjU5MTY4NTcxMTU4Njg5MiIsImF1ZCI6WyJodHRwczovL2FwaS5vcGVuYWkuY29tL3YxIiwiaHR0cHM6Ly9vcGVuYWkub3BlbmFpLmF1dGgwYXBwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2ODk5OTIxNTYsImV4cCI6MTY5MTIwMTc1NiwiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvcmdhbml6YXRpb24ud3JpdGUgb2ZmbGluZV9hY2Nlc3MifQ.vG0JDp_m_CwAEGlVQXQqlgEe-uX-S8FfkuxFlRKn48mMYp2J09fca21er_3iG9-7cK4CYLluggycVSeLywZPSn16AxHeEhGulK0RVWdXmYWSmEOnZj4AqdKgQURDltRKmP0eOsKB2uaQSxqzc_0-VqjQQq1iP8oePvBwUNv0iGEuOiP90utxnSF5x1v3El9n8bpTfE4nVCqF06mkj1nHoAn9SY0pcAcXPCS92HfR6LdwTvAh7N60YZcsXcEZl_kDEA_t8F2XvpWcoj78RZILVQWdLYo5IDfnXBx3jtu7uDgbzCfDLMk1TWRU-IyQ6F_luMtJGCGIaWEeZ0AF86FkGA"
  })

  const prompt = 'Hello'

  let res = await oraPromise(api.sendMessage(prompt), {
    text: prompt
  })

  console.log('\n' + res.text + '\n')
}


example()
*/