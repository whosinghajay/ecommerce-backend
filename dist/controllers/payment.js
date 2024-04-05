"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.allCoupon = exports.applyDiscount = exports.newCoupon = exports.createPaymentIntent = void 0;
const app_js_1 = require("../app.js");
const error_js_1 = require("../middlewares/error.js");
const coupon_js_1 = require("../models/coupon.js");
const utility_class_js_1 = __importDefault(require("../utils/utility-class.js"));
exports.createPaymentIntent = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount)
        return next(new utility_class_js_1.default("Please Enter Amount", 400));
    const paymentIntent = await app_js_1.stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "inr",
    });
    return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
    });
});
exports.newCoupon = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new utility_class_js_1.default("Please Enter both Coupon Code and Amount", 400));
    await coupon_js_1.Coupon.create({ code: coupon, amount });
    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} Created Successfully`,
    });
});
exports.applyDiscount = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await coupon_js_1.Coupon.findOne({ code: coupon });
    if (!discount)
        return next(new utility_class_js_1.default("Invalid Coupon Code", 400));
    return res.status(200).json({
        success: true,
        discount: discount.amount,
    });
});
exports.allCoupon = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const coupons = await coupon_js_1.Coupon.find({});
    return res.status(200).json({
        success: true,
        coupons,
    });
});
exports.deleteCoupon = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await coupon_js_1.Coupon.findByIdAndDelete(id);
    if (!coupon)
        return next(new utility_class_js_1.default("Invalid Coupon Id", 400));
    return res.status(200).json({
        success: true,
        message: `Coupon ${coupon.code} Deleted Successfully`,
    });
});
