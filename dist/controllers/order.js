"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.processOrder = exports.newOrder = exports.getSingleOrder = exports.allOrders = exports.myOrders = void 0;
const error_js_1 = require("../middlewares/error.js");
const order_js_1 = require("../models/order.js");
const features_js_1 = require("../utils/features.js");
const utility_class_js_1 = __importDefault(require("../utils/utility-class.js"));
const app_js_1 = require("../app.js");
exports.myOrders = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id: user } = req.query;
    const key = `my-orders-${user}`;
    let orders = [];
    if (app_js_1.myCache.has(key))
        orders = JSON.parse(app_js_1.myCache.get(key));
    else {
        orders = await order_js_1.Order.find({ user });
        app_js_1.myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({ success: true, orders });
});
exports.allOrders = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const key = "all-orders";
    let orders = [];
    if (app_js_1.myCache.has(key))
        orders = JSON.parse(app_js_1.myCache.get(key));
    else {
        orders = await order_js_1.Order.find().populate("user", "name"); // yeh populate yaha pe user ke sare information de dega , aur jo dursa argument diya hai usme humne name diya jisse vo sirf name hi show kargea ,, okay babu samaj gaye aap, thik hai fir
        app_js_1.myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({ success: true, orders });
});
exports.getSingleOrder = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const key = `order-${id}`;
    let order;
    if (app_js_1.myCache.has(key))
        order = JSON.parse(app_js_1.myCache.get(key));
    else {
        order = await order_js_1.Order.findById(id).populate("user", "name");
        if (!order)
            return next(new utility_class_js_1.default("Order Not Found", 404));
        app_js_1.myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({ success: true, order });
});
exports.newOrder = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, } = req.body;
    if (!shippingInfo ||
        !orderItems ||
        !user ||
        !subtotal ||
        !tax ||
        // !shippingCharges ||
        // !discount ||
        !total)
        return next(new utility_class_js_1.default("Please Enter All Fields", 500));
    const order = await order_js_1.Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    await (0, features_js_1.reduceStock)(orderItems);
    (0, features_js_1.invalidateCache)({
        product: true,
        order: true,
        admin: true,
        userId: user,
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res
        .status(201)
        .json({ success: true, message: "Order Placed Successfully" });
});
exports.processOrder = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const order = await order_js_1.Order.findById(id);
    if (!order)
        return next(new utility_class_js_1.default("Order Not Found", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }
    await order.save();
    (0, features_js_1.invalidateCache)({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });
    return res
        .status(200)
        .json({ success: true, message: "Order Processed Successfully" });
});
exports.deleteOrder = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const order = await order_js_1.Order.findById(id);
    if (!order)
        return next(new utility_class_js_1.default("Order Not Found", 404));
    await order.deleteOne();
    (0, features_js_1.invalidateCache)({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });
    return res
        .status(200)
        .json({ success: true, message: "Order Deleted Successfully" });
});
