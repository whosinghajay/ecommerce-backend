"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineCharts = exports.getBarCharts = exports.getPieCharts = exports.getDashBoardStats = void 0;
const app_js_1 = require("../app.js");
const error_js_1 = require("../middlewares/error.js");
const order_js_1 = require("../models/order.js");
const product_js_1 = require("../models/product.js");
const user_js_1 = require("../models/user.js");
const features_js_1 = require("../utils/features.js");
exports.getDashBoardStats = (0, error_js_1.TryCatch)(async (req, res, next) => {
    let stats = {};
    const key = "admin-stats";
    if (app_js_1.myCache.has(key))
        stats = JSON.parse(app_js_1.myCache.get(key));
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today,
        };
        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0), // iss wale last month ki last date mil jayegi
        };
        const thisMonthProductsPromise = product_js_1.Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthProductsPromise = product_js_1.Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const thisMonthUsersPromise = user_js_1.User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthUsersPromise = user_js_1.User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const thisMonthOrdersPromise = order_js_1.Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            },
        });
        const lastMonthOrdersPromise = order_js_1.Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            },
        });
        const lastSixMonthOrdersPromise = order_js_1.Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today,
            },
        });
        const latestTransactionsPromise = order_js_1.Order.find({})
            .select(["orderItems", "discount", "total", "status"])
            .limit(4);
        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productsCount, usersCount, allOrders, lastSixMonthOrders, categories, femaleUsersCount, latestTransaction,] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            product_js_1.Product.countDocuments(),
            user_js_1.User.countDocuments(),
            order_js_1.Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            product_js_1.Product.distinct("category"),
            user_js_1.User.countDocuments({ gender: "female" }),
            latestTransactionsPromise,
        ]);
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const changePercentage = {
            revenue: (0, features_js_1.calculatePercentage)(thisMonthRevenue, lastMonthRevenue),
            product: (0, features_js_1.calculatePercentage)(thisMonthProducts.length, lastMonthProducts.length),
            user: (0, features_js_1.calculatePercentage)(thisMonthUsers.length, lastMonthUsers.length),
            order: (0, features_js_1.calculatePercentage)(thisMonthOrders.length, lastMonthOrders.length),
        };
        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);
        const counts = {
            revenue,
            user: usersCount,
            product: productsCount,
            order: allOrders.length,
        };
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        const categoryCount = await (0, features_js_1.getInventories)({
            categories,
            productsCount,
        });
        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        };
        const modifiedLatestTransaction = latestTransaction.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }));
        stats = {
            categoryCount,
            changePercentage,
            counts,
            charts: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue,
            },
            userRatio,
            latestTransaction: modifiedLatestTransaction,
        };
        app_js_1.myCache.set(key, JSON.stringify(stats));
    }
    return res.status(200).json({ success: true, stats });
});
exports.getPieCharts = (0, error_js_1.TryCatch)(async (req, res, next) => {
    let charts;
    const key = "admin-pie-charts";
    if (app_js_1.myCache.has(key))
        charts = JSON.parse(app_js_1.myCache.get(key));
    else {
        const allOrderPromise = order_js_1.Order.find({}).select([
            "total",
            "discount",
            "subtotal",
            "tax",
            "shippingCharges",
        ]);
        const [processingOrder, shippingOrder, deliveredOrder, categories, productsCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers,] = await Promise.all([
            order_js_1.Order.countDocuments({ status: "Processing" }),
            order_js_1.Order.countDocuments({ status: "Shipped" }),
            order_js_1.Order.countDocuments({ status: "Delivered" }),
            product_js_1.Product.distinct("category"),
            product_js_1.Product.countDocuments(),
            product_js_1.Product.countDocuments({ stock: 0 }),
            allOrderPromise,
            user_js_1.User.find({}).select(["dob"]),
            user_js_1.User.countDocuments({ role: "admin" }),
            user_js_1.User.countDocuments({ role: "user" }),
        ]);
        const orderFullfillment = {
            processing: processingOrder,
            shipping: shippingOrder,
            delivered: deliveredOrder,
        };
        const productCategories = await (0, features_js_1.getInventories)({
            categories,
            productsCount,
        });
        const stockAvailablity = {
            inStock: productsCount - outOfStock,
            outOfStock,
        };
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        };
        const adminCustomers = {
            admin: adminUsers,
            customer: customerUsers,
        };
        charts = {
            orderFullfillment,
            productCategories,
            stockAvailablity,
            revenueDistribution,
            usersAgeGroup,
            adminCustomers,
        };
        app_js_1.myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
exports.getBarCharts = (0, error_js_1.TryCatch)(async (req, res, next) => {
    let charts;
    const key = "admin-bar-charts";
    if (app_js_1.myCache.has(key))
        charts = JSON.parse(app_js_1.myCache.get(key));
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        const sixMonthProductsPromise = product_js_1.Product.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today,
            },
        }).select("createdAt");
        const sixMonthUsersPromise = user_js_1.User.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today,
            },
        }).select("createdAt");
        const twelveMonthOrdersPromise = order_js_1.Order.find({
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today,
            },
        }).select("createdAt");
        const [products, users, orders] = await Promise.all([
            sixMonthProductsPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise,
        ]);
        const productCounts = (0, features_js_1.getChartData)({ length: 6, docArr: products, today });
        const userCounts = (0, features_js_1.getChartData)({ length: 6, docArr: users, today });
        const orderCounts = (0, features_js_1.getChartData)({ length: 12, docArr: orders, today });
        charts = {
            users: userCounts,
            products: productCounts,
            orders: orderCounts,
        };
        app_js_1.myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({ success: true, charts });
});
exports.getLineCharts = (0, error_js_1.TryCatch)(async (req, res, next) => {
    let charts;
    const key = "admin-line-charts";
    if (app_js_1.myCache.has(key))
        charts = JSON.parse(app_js_1.myCache.get(key));
    else {
        const today = new Date();
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today,
            },
        };
        const [products, users, orders] = await Promise.all([
            product_js_1.Product.find(baseQuery).select("createdAt"),
            user_js_1.User.find(baseQuery).select("createdAt"),
            order_js_1.Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ]);
        const productCounts = (0, features_js_1.getChartData)({ length: 12, docArr: products, today });
        const userCounts = (0, features_js_1.getChartData)({ length: 12, docArr: users, today });
        const discount = (0, features_js_1.getChartData)({
            length: 12,
            docArr: orders,
            today,
            property: "discount",
        });
        const revenue = (0, features_js_1.getChartData)({
            length: 12,
            docArr: orders,
            today,
            property: "total",
        });
        charts = {
            users: userCounts,
            products: productCounts,
            discount,
            revenue,
        };
        app_js_1.myCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({ success: true, charts });
});
