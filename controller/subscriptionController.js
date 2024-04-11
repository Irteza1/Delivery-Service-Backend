const express = require("express");
const router = express.Router();
const { Subscription } = require("../models/returnProcessSchema");

exports.createSubscription = async (req, res) => {
    const { name, price, period, total, duration, speed, support } = req.body;

    const newSubscription = new Subscription({
        name,
        price,
        period,
        total,
        duration,
        speed,
        support,
    });

    try {
        await newSubscription.save();
        res.status(200).send("Subscription saved successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send(
            "There was an error saving the subscription. Try again"
        );
    }
};
