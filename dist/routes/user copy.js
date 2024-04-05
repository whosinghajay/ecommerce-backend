"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_js_1 = require("../controllers/user.js");
const auth_js_1 = require("../middlewares/auth.js");
const app = express_1.default.Router();
app.post("/new", user_js_1.newUser);
app.get("/all", auth_js_1.adminOnly, user_js_1.getAllUsers);
// app.get("/:id", getUser);
// app.delete("/:id", deleteUser);
app.route("/:id").get(user_js_1.getUser).delete(auth_js_1.adminOnly, user_js_1.deleteUser);
exports.default = app;
