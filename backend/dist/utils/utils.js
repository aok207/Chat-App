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
exports.uploadFile = exports.emitEvent = exports.getFriends = exports.updateUserOnlineStatus = exports.verifyAccessToken = exports.removeExpiredTokens = exports.hashPassword = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const resetTokenModel_1 = __importDefault(require("../models/resetTokenModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const friendModel_1 = __importDefault(require("../models/friendModel"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
function createToken(info) {
    const jwtSecret = process.env.JWT_ACCESS_SECRET;
    const token = jsonwebtoken_1.default.sign(info, jwtSecret, {
        expiresIn: "30 days",
    });
    return token;
}
exports.createToken = createToken;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcryptjs_1.default.genSalt(10);
        return yield bcryptjs_1.default.hash(password, salt);
    });
}
exports.hashPassword = hashPassword;
function removeExpiredTokens() {
    return __awaiter(this, void 0, void 0, function* () {
        yield resetTokenModel_1.default.find({ expiresAt: { $lt: new Date() } }).deleteMany();
    });
}
exports.removeExpiredTokens = removeExpiredTokens;
function verifyAccessToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET || "");
            const user = (yield userModel_1.default.findOne({ _id: decoded.id }, { created_at: 0, updated_at: 0, password: 0, __v: 0, provider: 0 }));
            if (!user) {
                return { ok: false, message: "Wrong token!", data: null };
            }
            return { ok: true, message: null, data: user };
        }
        catch (error) {
            return { ok: false, message: "Invalid token!", data: null };
        }
    });
}
exports.verifyAccessToken = verifyAccessToken;
function updateUserOnlineStatus(id, isOnline) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userModel_1.default.findById(id);
        user.isOnline = isOnline;
        if (!isOnline) {
            user.lastOnline = new Date();
        }
        yield (user === null || user === void 0 ? void 0 : user.save());
    });
}
exports.updateUserOnlineStatus = updateUserOnlineStatus;
function getFriends(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const friends = yield friendModel_1.default.findOne({ userId: id });
        return friends;
    });
}
exports.getFriends = getFriends;
function emitEvent(usersMap, targetId, event, userId, ...data) {
    const targetSocket = usersMap.get(targetId);
    if (targetSocket) {
        targetSocket.emit(event, userId, ...data);
    }
}
exports.emitEvent = emitEvent;
// file is a base64 string
function uploadFile(file, resourceType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!resourceType) {
            resourceType = "image";
        }
        const uploadResult = yield cloudinary_1.default.uploader.upload(file, {
            folder: "Chat_app",
            use_filename: true,
            unique_filename: true,
            resource_type: resourceType,
        });
        return uploadResult;
    });
}
exports.uploadFile = uploadFile;
