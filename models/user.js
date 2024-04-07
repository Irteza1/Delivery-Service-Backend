const { mongoose } = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: false,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    // phoneNumber: {
    //     type: String,
    //     required: true,
    // },
    // address: {
    //     type: String,
    //     required: true,
    // },
    // suiteNo: {
    //     type: String,
    //     required: false,
    // },
    // city: {
    //     type: String,
    //     required: false,
    // },
    // postalCode: {
    //     type: String,
    //     required: false,
    // },
    password: {
        type: String,
        required: false,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false,
    },
    passwordResetToken: {
        type: String,
        required: false,
    },
    profilePic: {
        type: String,
        required: false,
    },
    provider: {
        type: String,
        required: false,
    },
});
module.exports = mongoose.model("User", userSchema);
