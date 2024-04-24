const { google } = require("googleapis");
const { Address } = require("../models/returnProcessSchema");
const fs = require("fs");
const moment = require("moment");
const credentials = JSON.parse(
    fs.readFileSync(
        require('path').resolve(__dirname, "../config/returnpal.json")
    )
);
const googleAuth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    "https://www.googleapis.com/auth/spreadsheets"
);

exports.updateSheet = async (req, res) => {
    console.log(req.body,'  body to save data  ');

    try {
        // Google Sheets API instance
        const sheets = google.sheets({ version: "v4", auth: googleAuth });
        console.log("working");
        // Check if the header row exists
        const headerCheck = await sheets.spreadsheets.values.get({
            spreadsheetId: "1v6z-QvnpERA0SnRHIMKo7Ct6NYDA0DuDaJQET4gr4-0",
            range: "Sheet1!A1:Z1",
        });

        const headerExists =
            headerCheck.data.values && headerCheck.data.values.length > 0;

        // Extract data from the received body
        const {
            orderId,
            invoiceNumber,
            orderDate,
            orderStatus,
            orderDetails: {
                pickupDetails,
                user,
                totalCost,
                pickupDate,
                pickupMethod,
                totalPackages,
                extraPackages,
                promoCode,
            },
            subscription: { type, expiryDate, price },
        } = req.body;

        // Since pickupDetails has changed, I've included this here for the fields
        // that went missing. Pickup details now references the related address to the pickup information
        const addressPickupInfo = await Address.findOne({ _id: pickupDetails });
        const {
            name,
            phoneNumber,
            address,
            city,
            province,
            country,
            unit,
            postalCode,
            instructions,
        } = addressPickupInfo;

        // Get the last used row
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: "1v6z-QvnpERA0SnRHIMKo7Ct6NYDA0DuDaJQET4gr4-0",
            range: "Sheet1!A:Z",
        });

        // Determine the next row number
        const nextRow = response.data.values
            ? response.data.values.length + 1
            : 2;

        // Add the header row if it doesn't exist
        if (!headerExists) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: "1v6z-QvnpERA0SnRHIMKo7Ct6NYDA0DuDaJQET4gr4-0",
                range: `Sheet1!A1:Z1`,
                valueInputOption: "RAW",
                resource: {
                    values: [
                        [
                            "Order ID",
                            "Invoice Number",
                            "Order Date",
                            "Order Status",
                            "User ID",
                            "Total Cost",
                            "Pickup Date",
                            "Pickup Method",
                            "Total Packages",
                            "Extra Packages",
                            "Promo Code",
                            "Name",
                            "Phone Number",
                            "Unit",
                            "Address",
                            "City",
                            "Province",
                            "Country",
                            "Postal Code",
                            "Instructions",
                            "Subscription Type",
                            "Subscription Expiry Date",
                            "Subscription Price",
                        ],
                    ],
                },
            });
        }
        const exactPrice = price / 100;
        const exactTotalCost = totalCost / 100;
        const dateOrder = moment(orderDate).format("YYYY-MM-DD");
        const datePickup = moment(pickupDate).format("YYYY-MM-DD");

        // Update data in the next row
        await sheets.spreadsheets.values.update({
            spreadsheetId: "1v6z-QvnpERA0SnRHIMKo7Ct6NYDA0DuDaJQET4gr4-0",
            range: `Sheet1!A${nextRow}:Z${nextRow}`,
            valueInputOption: "RAW",
            resource: {
                values: [
                    [
                        orderId,
                        invoiceNumber,
                        dateOrder,
                        orderStatus,
                        user,
                        exactTotalCost,
                        datePickup,
                        pickupMethod,
                        totalPackages,
                        extraPackages,
                        promoCode,
                        name,
                        phoneNumber,
                        unit,
                        address,
                        city,
                        province,
                        country,
                        postalCode,
                        instructions,
                        type,
                        expiryDate,
                        exactPrice,
                    ],
                ],
            },
        });

        console.log("Data added successfully to row:", nextRow);
    } catch (err) {
        console.error("updateSheet func() error:", err);
    }
};
