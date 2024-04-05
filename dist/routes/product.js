"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_js_1 = require("../controllers/product.js");
const auth_js_1 = require("../middlewares/auth.js");
const multer_js_1 = require("../middlewares/multer.js");
const app = express_1.default.Router();
app.post("/new", auth_js_1.adminOnly, multer_js_1.singleUpload, product_js_1.newProduct);
app.get("/all", product_js_1.getAllProducts);
app.get("/latest", product_js_1.getLatestProduct);
app.get("/categories", product_js_1.getAllCategories);
app.get("/admin-products", auth_js_1.adminOnly, product_js_1.getAdminProducts);
app
    .route("/:id")
    .get(product_js_1.getSingleProduct)
    .put(auth_js_1.adminOnly, multer_js_1.singleUpload, product_js_1.updateProduct)
    .delete(auth_js_1.adminOnly, product_js_1.deleteProduct);
exports.default = app;
