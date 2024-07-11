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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const userModel_1 = __importDefault(require("../models/userModel"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname.replace("\\dist", ""), "../../.env"),
});
function findOrCreateUser(name, email, provider, avatarPic, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const existingUser = yield userModel_1.default.findOne({ email });
            if (existingUser) {
                if (provider === existingUser.provider) {
                    return cb(null, {
                        name: existingUser.name,
                        email: existingUser.email,
                        isOnline: existingUser.isOnline,
                        avatar: existingUser.avatar,
                    });
                }
                else {
                    throw new Error("Your email is already registered with another provider.");
                }
            }
            else {
                // first check if username is taken
                const nameExists = yield userModel_1.default.findOne({ name });
                if (nameExists) {
                    name = null;
                }
                // make a new user
                const user = yield userModel_1.default.create({
                    name,
                    email,
                    avatar: avatarPic,
                    provider: provider,
                });
                if (user) {
                    return cb(null, {
                        name: user.name,
                        email: user.email,
                        isOnline: user.isOnline,
                        avatar: user.avatar,
                    });
                }
                else {
                    throw new Error();
                }
            }
        }
        catch (error) {
            console.log(error);
            return cb(null, false);
        }
    });
}
function verify(accessToken, refreshToken, profile, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(profile);
    });
}
function setupPassport() {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === "development" ? "/api/v1/auth/google/callback" : process.env.PRODUCTION_URL + "/api/v1/auth/google/callback",
    }, (accessToken, refreshToken, profile, cb) => {
        const { email, picture, name } = profile._json;
        findOrCreateUser(name, email, profile.provider, picture, cb);
    }));
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === "development" ? "/api/v1/auth/github/callback" : process.env.PRODUCTION_URL + "/api/v1/auth/github/callback",
        scope: ["user:email"],
    }, (accessToken, refreshToken, profile, cb) => {
        var _a;
        const emails = profile.emails;
        const pictures = profile.photos;
        findOrCreateUser(profile.username, (_a = emails[0]) === null || _a === void 0 ? void 0 : _a.value, profile.provider, pictures[0].value, cb);
    }));
}
exports.default = setupPassport;
