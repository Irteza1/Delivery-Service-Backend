const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  promoCode: { type: String, required: true },
  expireDate: { type: Date, required: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
module.exports = PromoCode;
