// Import functions from individual modules
const { remove_civitai_row } = require("./remove_civitai_row.js");
const { append_civitai_row } = require("./append_civitai_row.js");
const { update_civitai_row } = require("./update_civitai_row.js")

// Export all functions as properties of an object
module.exports = {
    remove_civitai_row,
    append_civitai_row,
    update_civitai_row
};