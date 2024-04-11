const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const uploadController = require("../controller/uploadController");

router.post("/", upload.single("file"), uploadController.file);
router.put("/:id", uploadController.updateReturnLabel);
router.delete("/:id", uploadController.deleteReturnLabel);

router.get("/user/:userId", uploadController.getAllReturnLabelsByUser);
router.delete("/user/:userId", uploadController.deleteReturnLabelsForUser);

module.exports = router;
