"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../middlewares/auth.js");
const payment_js_1 = require("../controllers/payment.js");
const app = express_1.default.Router();
app.post("/create", payment_js_1.createPaymentIntent);
app.post("/coupon/new", auth_js_1.adminOnly, payment_js_1.newCoupon);
app.get("/discount", payment_js_1.applyDiscount);
app.get("/coupon/all", auth_js_1.adminOnly, payment_js_1.allCoupon);
app.delete("/coupon/:id", auth_js_1.adminOnly, payment_js_1.deleteCoupon);
exports.default = app;
