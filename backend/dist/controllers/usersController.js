"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.deleteUser = exports.updatePassword = exports.updateUserProfile = exports.getUserProfile = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const utils_1 = require("../utils/utils");
function getUserProfile(req, res) {
    res.status(200).json(req.user);
}
exports.getUserProfile = getUserProfile;
const allowedExtensions = ["image/jpeg", "image/jpg", "image/png"];
function updateUserProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        // get the details user submitted
        const { email, name } = req.body;
        const avatar = req.file;
        let imageUrl = null;
        // For username, check if username already exists
        const usernameExists = yield userModel_1.default.findOne({ name });
        if (usernameExists) {
            return res.status(400).json({
                error: "Username is already taken!",
            });
        }
        // if there is a new avatar upload it to a image storage api
        if (avatar) {
            // validate the uploaded file
            if (!allowedExtensions.includes(avatar.mimetype)) {
                return res
                    .status(415)
                    .json({ error: "The avatar file type is not allowed!" });
            }
            if (avatar.size > 10000000) {
                return res
                    .status(413)
                    .json({ error: "The file size cannot be larger than 10 MB!" });
            }
            const b64 = Buffer.from(avatar.buffer).toString("base64");
            const dataURI = "data:" + avatar.mimetype + ";base64," + b64;
            const uploadResult = yield (0, utils_1.uploadFile)(dataURI);
            if (uploadResult.secure_url) {
                imageUrl = uploadResult.secure_url;
            }
        }
        const user = yield userModel_1.default.findOneAndUpdate({ name: (_a = req.user) === null || _a === void 0 ? void 0 : _a.name, email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email }, {
            name: name || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.name),
            email: email || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.email),
            avatar: imageUrl || ((_e = req.user) === null || _e === void 0 ? void 0 : _e.avatar),
            updated_at: Date.now(),
        });
        const updatedUser = yield userModel_1.default.findOne({
            _id: user === null || user === void 0 ? void 0 : user._id,
        }, { created_at: 0, updated_at: 0, password: 0, __v: 0 });
        res.status(200).json({
            message: "Profile updated successfully!",
            data: updatedUser,
        });
    });
}
exports.updateUserProfile = updateUserProfile;
function updatePassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { currentPassword, password, confirmPassword } = req.body;
        if (!currentPassword || !password || !confirmPassword) {
            return res
                .status(400)
                .json({ error: "Please fill in every required fields!" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "The passwords do not match!" });
        }
        try {
            const user = yield userModel_1.default.findOne({ email: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email });
            if (user) {
                if (user === null || user === void 0 ? void 0 : user.password) {
                    if (!(yield bcryptjs_1.default.compare(currentPassword, user.password))) {
                        return res.status(401).json({ error: "Incorrect current password!" });
                    }
                }
                const hashedPassword = yield (0, utils_1.hashPassword)(password);
                user.password = hashedPassword;
                yield (user === null || user === void 0 ? void 0 : user.save());
                return res
                    .status(200)
                    .json({ message: "Your password has been updated!" });
            }
            return res.status(404).json({ error: "User couldn't be found!" });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ error: "Something went wrong. Please try again!" });
        }
    });
}
exports.updatePassword = updatePassword;
function deleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const user = yield userModel_1.default.findOne({
                name: (_a = req.user) === null || _a === void 0 ? void 0 : _a.name,
                email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            });
            yield (user === null || user === void 0 ? void 0 : user.deleteOne());
            // log user out
            res.clearCookie("access_token").sendStatus(204);
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ error: "Something went wrong!" });
        }
    });
}
exports.deleteUser = deleteUser;
function searchUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const searchParam = req.query.name;
        const users = yield userModel_1.default.find({
            name: {
                $regex: ".*" + searchParam + ".*",
                $options: "i",
            },
            email: { $ne: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email },
        }, { password: 0, created_at: 0, updated_at: 0, __v: 0 });
        res.status(200).json({ data: users });
    });
}
exports.searchUsers = searchUsers;
