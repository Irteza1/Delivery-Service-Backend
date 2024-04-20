require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const { ConfirmOrder, Address } = require("../models/returnProcessSchema");
const PromoCode = require("../models/promocode");
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

class Order {
    constructor(id) {
        this.id = id; // references a common id: invoice id
        this.hasInvoiceSucceeded = false;
        this.hasCheckoutCompleted = false;
        this.data = {
            invoiceData: null,
            checkoutData: null,
        };
    }

    setInvoiceSucceeded(hasSucceded) {
        this.hasInvoiceSucceeded = hasSucceded;
    }

    setCheckoutCompleted(hasCompleted) {
        this.hasCheckoutCompleted = hasCompleted;
    }

    setCheckoutData(data) {
        this.data.checkoutData = data;
    }

    setInvoiceData(data) {
        this.data.invoiceData = data;
    }
}

// TODO (For scalability): Replace with queue based solution with Redis
// In-memory array to process purchases
// it is emptied once purchases have processed
const orders = [];

// Checks if the in-memory `orders` array contains
// an order with the inputted invoice id
function hasOrder(id) {
    return Boolean(orders.find((order) => order.id === id));
}

function getOrder(id) {
    return orders.find((order) => order.id === id);
}

function isOrderComplete(id) {
    if (hasOrder(id)) {
        const order = getOrder(id);
        return order.hasInvoiceSucceeded && order.hasCheckoutCompleted;
    }
    return false;
}

function removeOrder(id) {
    if (hasOrder(id)) {
        orders.splice(orders.indexOf(getOrder(id)));
        return true;
    }
    return false;
}

// Only for Bronze Plan, grabs the prices of additional boxes
function getAdditionalBoxPrice(products, prices) {
    const matchingProduct = products.find(
        (product) => product.name.toLowerCase() == "bronze"
    );
    const matchingPrice = prices.find(
        (price) => price.product === matchingProduct?.id
    );

    return matchingPrice?.id;
}

async function saveConfirmedOrder(order) {
    const { data } = order;
    const { metadata } = data.checkoutData;
    const { checkoutRefId } = data.checkoutData;

    const subscription = JSON.parse(metadata.subscription);
    subscription.expiryDate = new Date(subscription.expiryDate);

    const orderDetails = JSON.parse(metadata.orderDetails);
    const promoCode = metadata.promoCode ?? "";
    const { pickupDetails } = orderDetails;

    const orderToSave = {
        orderId: checkoutRefId,
        invoiceNumber: data.invoiceData.invoiceNumber,
        orderDate: new Date(),
        orderStatus: "Driver received",
        orderDetails: {
            user: orderDetails.user,
            totalCost: data.invoiceData.total,
            totalPackages: orderDetails.totalPackages,
            extraPackages: orderDetails.extraPackages,
            pickupDate: new Date(orderDetails.pickupDate),
            pickupMethod: orderDetails.pickupMethod,
            promoCode,
            pickupDetails,
        },
        subscription,
    };

    try {
        await axios.post(
            "https://api.returnpal.ca/api/confirm-pickup",
            orderToSave
        );
    } catch (err) {
        console.error(err);
    }
    try {
        await axios.post(
            "https://api.returnpal.ca/api/updategooglesheet",
            orderToSave
        );
    } catch (err) {
        console.error(err);
    }

    // once completed, remove from in-memory array
    removeOrder(order.id);
}

exports.success = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const rawData = req.body.toString();
    let event;

    console.log(typeof(rawData),'  request body type');
    console.log(rawData,'  body  data');
    console.log(sig,'  signature ');
    console.log(STRIPE_WEBHOOK_SECRET,'  STRIPE_WEBHOOK_SECRET ');

    try {
        event = await stripe.webhooks.constructEvent(
            rawData,
            sig,
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.log(`❌ Error message: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    const session = event.data.object;
    let order = null;
    switch (event.type) {
        // Grabs the invoice number
        case "invoice.payment_succeeded":
            if (!hasOrder(session.id)) {
                order = new Order(session.id);
                orders.push(order);
            } else {
                order = getOrder(session.id);
            }

            // Save the invoice number for saving into MongoDB
            order.setInvoiceData({
                invoiceNumber: session.number,
                total: session.total,
            });
            order.setInvoiceSucceeded(true);
            // console.log("INVOICE PAYMENT SUCCEDED");
            if (isOrderComplete(order.id)) {
                saveConfirmedOrder(order);
            }
            break;
        // Grabs the metadata and client reference id sent from the request
        case "checkout.session.completed":
            if (!hasOrder(session.invoice)) {
                order = new Order(session.invoice);
                orders.push(order);
            } else {
                order = getOrder(session.invoice);
            }

            // Save the metadata for saving into MongoDB
            order.setCheckoutData({
                metadata: session.metadata,
                checkoutRefId: session.client_reference_id,
            });
            order.setCheckoutCompleted(true);
            // console.log("CHECKOUT COMPLETED");
            if (isOrderComplete(order.id)) {
                saveConfirmedOrder(order);
            }
            break;
        default:
            // If needed, can handle other Stripe event types
            break;
    }

    res.status(200).json({ received: true });
};

exports.charge = async (req, res) => {
    try {
        const { orderDetails, discount, subscription, addressId } = req.body;
        const promoCode = discount?.promoCode ?? "";
        const matchingPromoCode = await PromoCode.findOne({ promoCode });
        const promoCodesRes = await stripe.coupons.list();
        const promoCodes = promoCodesRes.data;

        const productsRes = await stripe.products.list();
        const pricesRes = await stripe.prices.list();

        const products = productsRes.data;
        const prices = pricesRes.data;

        const matchingProduct = products.find(
            (product) =>
                product.name.toLowerCase() === subscription.type.toLowerCase()
        );
        const matchingPrice = prices.find(
            (price) => price.product === matchingProduct.id
        );

        const checkoutRefId = uuidv4();
        const session = await stripe.checkout.sessions.create({
            cancel_url: `https://returnpal.ca/schedule-pickup?success=false`,
            client_reference_id: checkoutRefId,
            currency: "CAD",
            discounts: [
                {
                    coupon:
                        promoCodes.find(
                            (promo) =>
                                promo.name.toLowerCase() == promoCode.toLowerCase()
                        )?.id ?? undefined,
                },
            ],
            invoice_creation: {
                enabled:
                    matchingProduct.name.toLowerCase() == "bronze"
                        ? true
                        : undefined,
            },
            line_items: [
                {
                    price: matchingPrice.id,
                    quantity: 1,
                },
                orderDetails.extraPackages
                    ? {
                        price: getAdditionalBoxPrice(products, prices),
                        quantity: orderDetails.extraPackages,
                    }
                    : undefined,
            ],
            mode:
                subscription.type.toLowerCase() === "bronze"
                    ? "payment"
                    : "subscription",
            metadata: {
                promoCode: promoCode || undefined,
                subscription: JSON.stringify({
                    type: subscription.type,
                    expiryDate: subscription.expiryDate,
                    price: matchingPrice.unit_amount,
                }),
                orderDetails: JSON.stringify({
                    user: orderDetails.user,
                    totalPackages: String(orderDetails.totalPackages),
                    extraPackages: String(orderDetails.extraPackages),
                    pickupDate: orderDetails.pickupDate,
                    pickupMethod: orderDetails.pickupMethod,
                    pickupDetails: addressId,
                }),
            },
            payment_method_types: ["card"],
            success_url: `https://returnpal.ca/confirmation/${checkoutRefId}`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.log(error,'  here is errro ');
        res.status(500).json("Internal server error")
    }
};

exports.getOrderDetails = async (req, res) => {
    try {
        const { orderRef } = req.body;
        const result = await ConfirmOrder.findOne({
            orderId: orderRef,
        }).populate("orderDetails.pickupDetails");
        res.json(result);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
