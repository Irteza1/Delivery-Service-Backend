const { Address } = require('../models/returnProcessSchema');
const { ConfirmOrder } = require("../models/returnProcessSchema");

const orderStatuses = {
    received: "Driver received",
    onTheWay: "Driver on the way",
    wayToPostOffice: "Driver delivered to post office",
    delivered: "Delivered",
    cancelled: "Cancelled",
}

exports.getOrders = async (req, res) => {
    const pageSize = 20;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const userId = req.query.userId;
    try {
        const skip = (page - 1) * perPage;
        const obj = { orderStatus: { $ne: orderStatuses.cancelled } };

        if (userId) {
            obj['orderDetails.user'] = userId
        }
        if (req.query.date) {
            const date = new Date(req.query.date);
            let date1 = new Date(req.query.date);
            date1.setDate(date1.getDate() + 1);

            obj.orderDate = {
                "$gte": date.toISOString(),
                "$lte": date1.toISOString()
            }
        }
        console.log(obj, ' obj');
        const orders = await ConfirmOrder.find(obj)
            .populate("orderDetails.pickupDetails")
            .populate("orderDetails.user")
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(perPage);
        const totalOrdersCount = await ConfirmOrder.countDocuments(obj);
        const totalPages = Math.ceil(totalOrdersCount / perPage);
        res.status(200).json({
            paginatedOrders: orders,
            currentPage: page,
            totalPages,
            totalOrders: totalOrdersCount,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error processing request", error });
    }
};

exports.getOrdersCountByUserId = async (req, res) => {

    try {
        const orders = await ConfirmOrder.countDocuments({ 'orderDetails.user': req.query.userId })

        res.status(200).json({ orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error processing request", error });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const newOrder = req.body;
        const order = await ConfirmOrder.create(newOrder);
        res.status(200).json({
            message: "Order created successfully",
            id: order._id,
        });
    } catch (error) {
        res.status(500).json({ message: "Error processing request", error });
    }
};

exports.getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await ConfirmOrder.findById({ _id: id });
        if (order) {
            const pickupDetailsId = order?.orderDetails?.pickupDetails;
            const pickupDetails = await Address.findById(pickupDetailsId);
            res.status(200).json({ order, pickupDetails });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving order details",
            error,
        });
    }
};

exports.updateOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedOrder = req.body;
        const result = await ConfirmOrder.findByIdAndUpdate(
            { _id: id },
            {
                orderStatus: orderStatuses.cancelled,
            }
        );
        if (result) {
            res.status(200).json({ message: "Order updated successfully" });
        } else {
            res.status(404).json({
                message: "Order not found or not modified",
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating order", error });
    }
};
