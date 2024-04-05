"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChartData = exports.getInventories = exports.calculatePercentage = exports.reduceStock = exports.invalidateCache = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const app_js_1 = require("../app.js");
const product_js_1 = require("../models/product.js");
const connectDB = (url) => {
    mongoose_1.default
        .connect(url, { dbName: "ecommerce" })
        .then((c) => console.log(`DB Connected to ${c.connection.host}`))
        .catch((e) => console.log("DB Connection error", e));
};
exports.connectDB = connectDB;
const invalidateCache = ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = [
            "latest-product",
            "categories",
            "all-products",
        ];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));
        app_js_1.myCache.del(productKeys);
    }
    if (order) {
        const ordersKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        app_js_1.myCache.del(ordersKeys);
    }
    if (admin) {
        app_js_1.myCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts",
        ]);
    }
};
exports.invalidateCache = invalidateCache;
const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await product_js_1.Product.findById(order.productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= order.quantity;
        await product.save();
    }
};
exports.reduceStock = reduceStock;
const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percentage = (thisMonth / lastMonth) * 100;
    return Number(percentage.toFixed(0));
};
exports.calculatePercentage = calculatePercentage;
const getInventories = async ({ categories, productsCount, }) => {
    const categoriesCountPromise = categories.map((category) => product_js_1.Product.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount = [];
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100),
        });
    });
    return categoryCount;
};
exports.getInventories = getInventories;
const getChartData = ({ length, docArr, today, property, }) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthDiff < length) {
            if (property) {
                data[length - monthDiff - 1] += i[property];
            }
            else {
                data[length - monthDiff - 1] += 1;
            }
            // data[length - monthDiff - 1] += property ? i[property]! : 1;
        }
    });
    return data;
};
exports.getChartData = getChartData;
