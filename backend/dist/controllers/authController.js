"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.logout = exports.verifyResetToken = exports.resetPassword = exports.forgotPassword = exports.register = exports.socialCallback = exports.login = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const utils_1 = require("../utils/utils");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importStar(require("../config/nodemailer"));
const resetTokenModel_1 = __importDefault(require("../models/resetTokenModel"));
const users = [
    {
        email: "AOK",
        password: "password",
    },
];
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Both email and password fields are required." });
        }
        // find user
        try {
            const user = yield userModel_1.default.findOne({ email: email });
            if (!user) {
                return res
                    .status(404)
                    .json({ error: "A user doesn't exist with the given email." });
            }
            if (user.password) {
                if (!user || (user && !(yield bcryptjs_1.default.compare(password, user.password)))) {
                    return res.status(401).json({ error: "Incorrect email or password!" });
                }
            }
            else {
                // If there is no password the user is signed in with either google or github
                return res
                    .status(401)
                    .json({ error: "This email is registered with a different provider." });
            }
            // Log user in
            const token = (0, utils_1.createToken)({
                id: user.id,
            });
            res
                .cookie("access_token", token, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
                .status(200)
                .json({ message: "Logged In successfully." });
        }
        catch (error) {
            return res
                .status(500)
                .json({ error: "Error while logging in, please try again." });
        }
    });
}
exports.login = login;
// success callback function for socail logins
function socialCallback(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const email = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        try {
            const user = yield userModel_1.default.findOne({ email });
            if (user) {
                const token = (0, utils_1.createToken)({ id: user._id });
                res
                    .cookie("access_token", token, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                })
                    .redirect(process.env.NODE_ENV === "development"
                    ? process.env.CLIENT_URL + "/login?success=oAuth"
                    : "/login?success=oAuth");
            }
            else {
                throw new Error();
            }
        }
        catch (error) {
            console.log(error);
            res.redirect(process.env.NODE_ENV === "development"
                ? process.env.CLIENT_URL + "/login?success=oAuth"
                : "/login?success=oAuth");
        }
    });
}
exports.socialCallback = socialCallback;
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res
                .status(400)
                .json({ error: "Please fill in every required field!" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match." });
        }
        // find if user exists
        try {
            const existingUser = yield userModel_1.default.findOne({ $or: [{ name, email }] });
            if (existingUser) {
                if (existingUser.email === email) {
                    return res
                        .status(400)
                        .json({ error: "User with the same email already exists!" });
                }
                if (existingUser.name === name) {
                    return res.status(400).json({
                        error: "Username already in use. Please choose a different username.",
                    });
                }
            }
            else {
                // make a new user
                const user = yield userModel_1.default.create({
                    name,
                    email,
                    password: yield (0, utils_1.hashPassword)(password),
                });
                if (user) {
                    const token = (0, utils_1.createToken)({
                        id: user.id,
                    });
                    res
                        .cookie("access_token", token, {
                        maxAge: 1000 * 60 * 60 * 24 * 30,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    })
                        .status(201)
                        .json({ message: "Account created successfully!" });
                }
                else {
                    throw new Error();
                }
            }
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Something went wrong while registering. Please try again. 😥",
            });
        }
    });
}
exports.register = register;
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email field is required!" });
        }
        const checkUserExists = yield userModel_1.default.findOne({ email });
        if (!checkUserExists) {
            return res
                .status(404)
                .json({ error: "There is no user associated with that email!" });
        }
        if (checkUserExists.provider !== null) {
            return res
                .status(404)
                .json({ error: "Your email is registered with an another provider." });
        }
        // If passed all the checks, send the email
        // But first create a token
        const token = (0, utils_1.createToken)({ email });
        try {
            // Store it in the database
            // Expire time is one hour
            yield resetTokenModel_1.default.create({
                email,
                token,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            });
            const info = yield nodemailer_1.default.sendMail({
                from: '"Pulse Chat" <aungookhant.business@gmail.com>',
                to: email,
                subject: "Your password reset link!",
                html: (0, nodemailer_1.getMailHtml)(checkUserExists.name, `${process.env.CLIENT_URL}/reset-password/${token}`),
            });
            console.log("Message sent: %s", info.messageId);
            res.status(200).json({
                message: "An email with the link to reset your password, has been sent. Please check your inbox.",
            });
        }
        catch (err) {
            console.log(err);
            if (err.code === 11000 && err.name === "MongoServerError") {
                return res
                    .status(400)
                    .json({ error: "The password reset email has already been sent!" });
            }
            res.status(500).json({ error: "Something went wrong! Please try again!" });
        }
    });
}
exports.forgotPassword = forgotPassword;
function verifyResetToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.params.token;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            if (decoded) {
                const tokenExists = yield resetTokenModel_1.default.findOne({ email: decoded.email });
                // Checks for token
                if (!tokenExists) {
                    return res.sendStatus(404);
                }
                if (tokenExists.token !== token) {
                    return res.sendStatus(401);
                }
                if (tokenExists.expiresAt < new Date()) {
                    return res.sendStatus(404);
                }
                return res.sendStatus(200);
            }
            else {
                return res.sendStatus(401);
            }
        }
        catch (err) {
            res.sendStatus(400);
        }
    });
}
exports.verifyResetToken = verifyResetToken;
function resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.params.token;
        const { password, confirmPassword } = req.body;
        if (!password || !confirmPassword) {
            return res
                .status(400)
                .json({ error: "Please fill in every required fields!" });
        }
        try {
            // get the email from the token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            if (!decoded.email) {
                return res.status(401).json({ error: "Invalid token." });
            }
            // Search the token in the database
            const tokenExists = yield resetTokenModel_1.default.findOne({ email: decoded.email });
            if (!tokenExists || tokenExists.token !== token) {
                return res.status(404).json({ error: "Wrong token!" });
            }
            // Check if the token has expired
            if (tokenExists.expiresAt < new Date()) {
                return res.status(404).json({ error: "Token has expired!" });
            }
            // If passed all of the above checks, we'll start the password reset process
            if (password !== confirmPassword) {
                return res.status(400).json({ error: "Passwords do not match!" });
            }
            // hash the password
            const hashedPassword = yield (0, utils_1.hashPassword)(password);
            // find the user
            const user = yield userModel_1.default.findOne({ email: decoded.email });
            if (!user) {
                res.status(404).json({ error: "Email not found!" });
            }
            user.password = hashedPassword;
            yield (user === null || user === void 0 ? void 0 : user.save());
            // delete the token from the db
            yield tokenExists.deleteOne();
            res
                .status(200)
                .json({ message: "Your password have been updated successfully!" });
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: "Something went wrong. Please try again." });
        }
    });
}
exports.resetPassword = resetPassword;
function logout(req, res) {
    res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Logged out successfully!" });
}
exports.logout = logout;
