const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    orderDate: { type: Date, default: Date.now() },
    orderStatus: {
        type: String,
        enum: [
            "Driver received",
            "Driver on the way",
            "Driver delivered to post office",
            "Delivered",
            "Cancelled",
        ],
    },
    orderDetails: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        totalCost: { type: Number, required: true },
        pickupDate: { type: Date, required: true },
        pickupMethod: {
            type: String,
            enum: ["Direct Handoff", "Leave on Doorstep"],
            required: true,
        },
        totalPackages: { type: Number, required: true },
        extraPackages: { type: Number, required: true },
        promoCode: { type: String },
        pickupDetails: {
            type: mongoose.Schema.ObjectId,
            ref: "Address",
            required: true,
        },
    },
    subscription: {
        type: {
            type: String,
            enum: ["Bronze", "Silver", "Gold", "Platinum"],
            required: true,
        },
        expiryDate: { type: Date, required: true },
        price: { type: Number },
    },
});

const returnLabelSchema = new mongoose.Schema({
    attachment: { type: String },
    description: { type: String },
    image: { type: Buffer },
    labelType: {
        type: String,
        enum: ["Physical", "Digital", "Amazon"],
        required: true,
    },
    orderId: { type: String, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const subscriptionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    period: { type: String, required: true },
    total: { type: String, required: true },
    duration: { type: String, required: true },
    speed: { type: String, required: true },
    support: { type: String, required: true },
});

const returnProcessSchema = new mongoose.Schema({
    dateAndTime: { type: Date, required: true },
    deliveryOption: { type: String, required: true },
    price: {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        itemId: { type: String, required: true },
    },
    confirmPickUp: {
        subscriptionItem: {
            itemId: { type: String, required: true },
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
        packageItem: {
            itemId: { type: String, required: true },
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
        expiryDate: {
            orderDate: { type: Date, required: true },
            subscription: { type: String, required: true },
        },
        calculateCost: {
            subscription: { type: String, required: true },
            packages: { type: Number, required: true },
        },
    },
    orderConfirmation: orderSchema,
    subscription: subscriptionSchema,
});

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    unit: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, default: "Ontario", required: true },
    country: { type: String, default: "Canada", required: true },
    postalCode: { type: String, required: true },
    instructions: { type: String },
    isPrimary: { type: Boolean, default: false },
});

module.exports = {
    Address: mongoose.model("Address", addressSchema),
    ReturnProcess: mongoose.model("ReturnProcess", returnProcessSchema),
    ConfirmOrder: mongoose.model("ConfirmOrder", orderSchema),
    ReturnLabel: mongoose.model("ReturnLabel", returnLabelSchema),
    Subscription: mongoose.model("Subscription", subscriptionSchema),
};
