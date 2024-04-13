const express = require("express");
const router = express.Router();
const promocodeController = require("../controller/promocodeController");

router.get("/", promocodeController.getAllPromoCodes);

router.get("/:id", promocodeController.getPromoCodeById);

router.post("/", promocodeController.createPromoCode);

router.put("/:id", promocodeController.updatePromoCodeById);

router.delete("/:id", promocodeController.deletePromoCodeById);

module.exports = router;
