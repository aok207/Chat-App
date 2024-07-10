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
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestOnly = exports.authOnly = void 0;
const utils_1 = require("../utils/utils");
function authOnly(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.cookies["access_token"];
        if (!token) {
            return res.status(401).json({ error: "You are not logged in!" });
        }
        const verify = yield (0, utils_1.verifyAccessToken)(token);
        if (verify.ok) {
            req.user = verify.data;
        }
        else {
            return res.status(401).json({ error: verify.message });
        }
        next();
    });
}
exports.authOnly = authOnly;
function guestOnly(req, res, next) {
    const token = req.cookies["access_token"];
    if (token) {
        return res.status(403).json({ error: "You are already logged in!" });
    }
    next();
}
exports.guestOnly = guestOnly;
