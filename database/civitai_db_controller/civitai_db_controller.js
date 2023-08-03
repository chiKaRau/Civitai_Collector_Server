// Import functions from individual modules
const { create_civitai_db } = require("./create_civitai_db.js");
const { init_civitai_db_collection } = require("./init_civitai_db_collection.js");
const { init_civitai_db_all_collections } = require("./init_civitai_db_all_collections.js")
const { insert_civitai_document } = require("./insert_civitai_document.js");
const { update_civitai_document } = require("./update_civitai_document.js");
const { remove_civitai_document } = require("./remove_civitai_document.js");
const { find_civitai_documents_by_title } = require("./find_civitai_documents_by_title.js");
const { find_civitai_documents_by_modelID } = require("./find_civitai_documents_by_modelID.js")
const { find_civitai_documents_by_url } = require("./find_civitai_documents_by_url.js")
const { find_last_appended_civitai_documents } = require("./find_last_appended_civitai_documents.js")
const { call_civitai_db } = require("./call_civitai_db.js")

// Export all functions as properties of an object
module.exports = {
    call_civitai_db,
    create_civitai_db,
    init_civitai_db_collection,
    init_civitai_db_all_collections,
    insert_civitai_document,
    update_civitai_document,
    remove_civitai_document,
    find_civitai_documents_by_title,
    find_civitai_documents_by_modelID,
    find_civitai_documents_by_url,
    find_last_appended_civitai_documents
};