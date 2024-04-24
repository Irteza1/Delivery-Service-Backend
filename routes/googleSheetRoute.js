const express = require("express");
const router = express.Router();
const googleSheet = require("../controller/googleSheetController");
router.post("/", googleSheet.updateSheet);
module.exports = router;
