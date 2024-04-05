"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../middlewares/auth.js");
const order_js_1 = require("../controllers/order.js");
const app = express_1.default.Router();
app.post("/new", order_js_1.newOrder);
app.get("/my", order_js_1.myOrders);
app.get("/all", auth_js_1.adminOnly, order_js_1.allOrders);
app
    .route("/:id")
    .get(order_js_1.getSingleOrder)
    .put(auth_js_1.adminOnly, order_js_1.processOrder)
    .delete(auth_js_1.adminOnly, order_js_1.deleteOrder);
exports.default = app;
