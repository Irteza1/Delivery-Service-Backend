const PromoCode = require("../models/promocode");

exports.getAllPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find();
    res.json(promoCodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.json(promoCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPromoCode = async (req, res) => {
  const promoCode = new PromoCode({
    promoCode: req.body.promoCode,
    expireDate: req.body.expireDate,
    discountPercentage: req.body.discountPercentage,
  });

  try {
    const newPromoCode = await promoCode.save();
    res.status(201).json(newPromoCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.json(promoCode);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) {
      return res.status(404).json({ message: "Promo code not found" });
    }
    res.json({ message: "Promo code deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
