"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUser = exports.getAllUsers = exports.newUser = void 0;
const user_js_1 = require("../models/user.js");
const utility_class_js_1 = __importDefault(require("../utils/utility-class.js"));
const error_js_1 = require("../middlewares/error.js");
exports.newUser = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await user_js_1.User.findById(_id);
    if (user)
        return res.status(200).json({
            success: true,
            message: `Welcome, ${user.name}`,
        });
    if (!_id || !name || !email || !photo || !gender || !dob)
        return next(new utility_class_js_1.default("Please add all the fields", 400));
    user = await user_js_1.User.create({
        name,
        email,
        photo,
        gender,
        _id,
        dob: new Date(dob),
    });
    return res.status(201).json({
        success: true,
        message: `Welcome, ${user.name}`,
    });
});
exports.getAllUsers = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const users = await user_js_1.User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
exports.getUser = (0, error_js_1.TryCatch)(async (req, res, next) => {
    // const id = req.params.id;
    const { id } = req.params;
    const user = await user_js_1.User.findById(id);
    if (!user)
        return next(new utility_class_js_1.default("Invalid Id", 400));
    return res.status(200).json({
        success: true,
        user,
    });
});
exports.deleteUser = (0, error_js_1.TryCatch)(async (req, res, next) => {
    const { id } = req.params;
    const user = await user_js_1.User.findById(id);
    if (!user)
        return next(new utility_class_js_1.default("Invalid Id", 400));
    await user?.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});
