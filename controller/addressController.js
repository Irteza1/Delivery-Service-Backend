const { Address } = require("../models/returnProcessSchema");
const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");

exports.getByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const address = await Address.find({ user: userId });
        if (address) {
            res.status(200).json(address);
        } else {
            res.status(404).json({
                message: `Address with user id:\"${String(
                    userId
                )}\" does not exist!`,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error retrieving address",
            err,
        });
    }
};

exports.getById = async (req, res) => {
    const { id } = req.params;
    try {
        const address = await Address.findOne({ _id: id });
        if (address) {
            res.status(200).json(address);
        } else {
            res.status(404).json({
                message: `Address \"${String(id)}\" does not exist!`,
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error retrieving address",
            err,
        });
    }
};

exports.create = async (req, res) => {
    try {
        const addressData = req.body;

        const newAddress = new Address(addressData);
        await User.findOneAndUpdate(
            { _id: addressData.user },
            { $addToSet: { addresses: newAddress._id } }
        );
        await newAddress.save();
        res.status(201).json(newAddress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing request", error });
    }
};

exports.updateById = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedAddress = req.body;

        const address = await Address.findOneAndUpdate(
            { _id: id },
            updatedAddress,
            { new: true }
        );

        if (address) {
            res.status(200).json({ message: "Address updated successfully" });
        } else {
            res.status(404).json({
                message: `Address \"${String(id)}\" not found or not modified`,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating address", error });
    }
};

exports.deleteById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAddress = await Address.findOneAndDelete({
            _id: id,
        });

        if (!deletedAddress) {
            return res.status(404).json({ error: "Address not found" });
        }

        // Return the deleted item in the response with a 200 OK status code
        res.status(200).json(deletedAddress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
