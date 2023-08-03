const fs = require('fs');

function convertAndWriteFile(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(inputFile, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file: ${inputFile}`);
        reject(err);
        return;
      }

      const lines = data.trim().split('\n');

      // Remove the first two lines
      lines.splice(0, 2);

      // Move ./@scan@/Temp to the first line
      lines.unshift(lines.splice(lines.indexOf('./@scan@/Temp'), 1)[0]);

      const options = lines.map((line) => {
        const path = `/${line.substring(2)}/`; // Wrap the line with "/"
        return path;
      });

      const jsonData = JSON.stringify(options, null, 4);

      fs.writeFile(outputFile, jsonData, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file: ${outputFile}`);
          reject(err);
          return;
        }
        console.log(`Data successfully converted and written to: ${outputFile}`);
        resolve();
      });
    });
  });
}

function readFile(callback) {
  fs.readFile('folder_list.json', 'utf8', (err, data) => {
    if (err) {
      // Handle the error
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    callback(jsonData);
  });
}

function errorResponseSetter(err) {
  let errorResponse = {};

  switch (err.name) {
    case 'getDataError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while retrieving Data.',
        },
      };
      break;
    case 'writeToSheetError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while appending data into Google Sheet.',
        },
      };
      break;
    case 'listAutoCompleteError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while retrieving auto complete list data.',
        },
      };
      break;
    case 'listSheetsError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while retrieving sheets list data.',
        },
      };
      break;
    case 'downloadFileError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while downloading file data',
        },
      };
      break;
    case 'readFromSheetError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while reading data from sheet.',
        },
      };
      break;
    case 'queryRowByValuesError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while querying data from sheet.',
        },
      };
      break;
    case 'listSuggestionTagsError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while retrieving suggestion tag list.',
        },
      };
      break;
    case 'remove_from_sheetError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while removing row from sheet.',
        },
      };
      break;
    case 'updateSheetError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while updating sheet.',
        },
      };
      break;
    case 'mongodbError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while accessing database.',
        },
      };
      break;
    case 'findLoraError':
      errorResponse = {
        error: {
          name: err.name,
          message: 'Error while accessing database.',
        },
      };
      break;
    default:
      errorResponse = {
        error: {
          name: "InternalServerError",
          message: 'Internal Server Error',
        },
      };
      break;
  }

  return errorResponse;
}

module.exports = { convertAndWriteFile, readFile, errorResponseSetter };
