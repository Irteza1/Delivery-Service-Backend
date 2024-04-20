const path = require("path");
const multer = require("multer");

// Create API endpoints in Node

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
});

module.exports = upload;
