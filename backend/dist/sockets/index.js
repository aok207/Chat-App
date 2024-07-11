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
exports.server = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname.replace("\\dist", ""), "../../.env"),
});
const express_1 = __importDefault(require("express"));
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const cookie_1 = __importDefault(require("cookie"));
const db_1 = __importDefault(require("../config/db"));
const utils_1 = require("../utils/utils");
const app = (0, express_1.default)();
exports.app = app;
(0, db_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));
// app.use(cookieParser());
let server;
if (process.env.NODE_ENV === "development") {
    exports.server = server = (0, node_http_1.createServer)(app);
}
else {
    exports.server = server = (0, node_https_1.createServer)(app);
}
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST"],
    },
    cookie: true,
});
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!socket.handshake.headers.cookie) {
        return next(new Error("No token"));
    }
    const parsedCookie = cookie_1.default.parse(socket.handshake.headers.cookie);
    if (!parsedCookie["access_token"]) {
        return next(new Error("No token"));
    }
    const verify = yield (0, utils_1.verifyAccessToken)(parsedCookie["access_token"]);
    if (!verify.ok) {
        return next(new Error(verify.message));
    }
    socket.user = verify.data;
    next();
}));
// online users
const onlineUsers = new Map();
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = socket.user) === null || _a === void 0 ? void 0 : _a._id;
    // update the user's online status to online
    (0, utils_1.updateUserOnlineStatus)(userId, true);
    onlineUsers.set(userId === null || userId === void 0 ? void 0 : userId.toString(), socket);
    io.emit("user online", userId);
    socket.on("disconnect", () => {
        var _a;
        (0, utils_1.updateUserOnlineStatus)((_a = socket.user) === null || _a === void 0 ? void 0 : _a._id, false);
        io.emit("user offline", userId);
        onlineUsers.delete(userId === null || userId === void 0 ? void 0 : userId.toString());
    });
    // event when the user is typing
    socket.on("typing to", (targetId) => {
        (0, utils_1.emitEvent)(onlineUsers, targetId, "other user is typing", userId);
    });
    socket.on("stopped typing to", (targetId) => {
        (0, utils_1.emitEvent)(onlineUsers, targetId, "other user stopped typing", userId);
    });
    // changes in message event (send, edit, delete)
    socket.on("changed messages", (targetId) => {
        (0, utils_1.emitEvent)(onlineUsers, targetId, "messages changed", userId);
    });
    // mark as read event
    socket.on("message read", (targetId) => {
        (0, utils_1.emitEvent)(onlineUsers, targetId, "other has read message", userId);
    });
    // user gave an reaction event
    socket.on("give reaction", (originalEmoji, emoji, targetId, messageId) => {
        (0, utils_1.emitEvent)(onlineUsers, targetId, "reaction added", userId, originalEmoji, emoji, messageId);
    });
    // user removed an reaction event
    socket.on("remove reaction", (emoji, targetId, messageId) => {
        (0, utils_1.emitEvent)(onlineUsers, targetId, "reaction removed", userId, emoji, messageId);
    });
}));
