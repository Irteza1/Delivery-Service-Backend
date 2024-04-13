const mongoose = require("mongoose");
const { Schema } = mongoose;

const addressSchema = new Schema({
  contact_full_name: { type: String, required: true },
  contact_phone_number: { type: String, required: true },
  street: { type: String, required: true },
  unit_number: String,
  city: { type: String, required: true },
  province: { type: String, default: "Ontario" },
  country: { type: String, default: "Canada" },
  postal_code: {
    type: String,
    validate: {
      validator: (value) => /^\d{5}$/.test(value),
      message: "Invalid postal code format",
    },
    required: true,
  },
  instructions: String,
  primary: { type: Boolean, default: false },
});

const packageDetailSchema = new Schema({
  attachment: String,
  label_type: String,
  description: String,
});

const pickupDetailSchema = new Schema({
  full_name: { type: String, required: true },
  phone_number: { type: String, required: true },
  street: { type: String, required: true },
  unit_number: String,
  city: { type: String, required: true },
  province: { type: String, default: "Ontario" },
  country: { type: String, default: "Canada" },
  postal_code: {
    type: String,
    validate: {
      validator: (value) => /^\d{5}$/.test(value),
      message: "Invalid postal code format",
    },
    required: true,
  },
  instructions: String,
  pickup_date: Date,
  pickup_method: String,
});

const orderDetailsSchema = new Schema({
  total_cost: { type: Number, default: 0 },
  promo_code: String,
  total_packages: Number,
  extra_packages_included: Number,
  package_details: [packageDetailSchema],
  pickup_details: pickupDetailSchema,
});

const clientDetailsSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  subscription: String,
  subscription_expiry_date: Date,
  email: String,
  phone_number: String,
  payment_type: String,
  addresses: [addressSchema],
});

const orderSchema = new Schema({
  order_number: { type: String, required: true },
  order_date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: [
      "Cancelled",
      "Driver on the way",
      "Driver delivered to post office",
      "Delivered",
      "Driver received",
    ],
    required: true,
  },
  order_details: orderDetailsSchema,
  client_details: clientDetailsSchema,
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
