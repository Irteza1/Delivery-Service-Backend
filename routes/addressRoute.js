const express = require("express");
const router = express.Router();
const addressController = require("../controller/addressController");

router.get("/:id", addressController.getById);
router.get("/user/:userId", addressController.getByUserId);
router.post("/", addressController.create);
router.put("/:id", addressController.updateById);
router.delete("/:id", addressController.deleteById);

module.exports = router;
