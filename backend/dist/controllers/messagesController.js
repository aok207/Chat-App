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
exports.getChats = exports.getReactions = exports.removeReaction = exports.addReaction = exports.deleteMessage = exports.editMessage = exports.sendMessage = exports.markAsRead = exports.getMessages = void 0;
const friendModel_1 = __importDefault(require("../models/friendModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/userModel"));
const messageModel_1 = __importDefault(require("../models/messageModel"));
const utils_1 = require("../utils/utils");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
function getMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        try {
            const otherUser = yield userModel_1.default.findById((_b = req.params) === null || _b === void 0 ? void 0 : _b.receiverId, {
                _id: 1,
                name: 1,
                email: 1,
                avatar: 1,
                isOnline: 1,
                lastOnline: 1,
            });
            // Check if the user exists
            if (!otherUser) {
                return res.status(404).json({ error: "User doesn't exist" });
            }
            let page = req.query.page;
            // The following code makes sure that when the page query param is
            // - not a number
            // - less than or equal to 0
            // - not included
            // it will default to 1
            if (!page) {
                page = 1;
            }
            else {
                page = parseInt(page);
                if (Number.isNaN(page)) {
                    page = 1;
                }
                if (page <= 0) {
                    page = 1;
                }
            }
            // amount of message to return in each request
            const amount = 10;
            const totalMessagesCount = yield messageModel_1.default.countDocuments({
                "recieverId.1": { $exists: false },
                $or: [
                    { senderId: userId, receiverId: otherUser._id },
                    { senderId: otherUser._id, receiverId: userId },
                ],
            });
            if (totalMessagesCount === 0) {
                return res
                    .status(200)
                    .json({ data: { messages: [], otherUser }, nextPage: null });
            }
            const messages = yield messageModel_1.default.find({
                "recieverId.1": { $exists: false },
                $or: [
                    { senderId: userId, receiverId: otherUser._id },
                    { senderId: otherUser._id, receiverId: userId },
                ],
            })
                .sort({ createdAt: -1 })
                .skip(amount * (page - 1))
                .limit(amount);
            const hasNextPage = totalMessagesCount - (amount * (page - 1) + amount) > 0;
            return res.status(200).json({
                data: { messages, otherUser: page === 1 ? otherUser : null },
                nextPage: hasNextPage ? page + 1 : null,
            });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ error: "Something went wrong! Please try again!" });
        }
    });
}
exports.getMessages = getMessages;
function markAsRead(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const { otherId } = req.params;
        try {
            const otherUser = yield userModel_1.default.findById(otherId);
            if (!otherUser) {
                return res.status(404).json({ error: "User doesn't exist" });
            }
            const messages = yield messageModel_1.default.find({
                senderId: otherUser._id,
                receiverId: userId,
            });
            if (messages.length === 0) {
                return res.sendStatus(200);
            }
            for (const message of messages) {
                if (message.status !== "read") {
                    message.status = "read";
                    yield message.save();
                }
            }
            return res.sendStatus(200);
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ error: "Something went wrong! Please try again!" });
        }
    });
}
exports.markAsRead = markAsRead;
function sendMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { receiverId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const { message, replyingTo, fileObj, fileType, } = req.body;
            const file = req.file;
            if (!receiverId || !userId) {
                return res.status(400).json({ error: "Invalid message!" });
            }
            if (!message && !file && !fileObj) {
                return res.status(400).json({ error: "Message content is needed." });
            }
            // You can't message yourself
            if (userId.toString() === receiverId) {
                return res.status(400).json({ error: "You can't message yourself!" });
            }
            // check if recieverId exists
            const receiver = yield userModel_1.default.findById(receiverId);
            if (!receiver) {
                return res.status(404).json({ error: "Receiver does not exist!" });
            }
            // if this is a reply, check if replying to message exists
            if (replyingTo) {
                const replyingMessage = yield messageModel_1.default.findById(replyingTo);
                if (!replyingMessage) {
                    return res
                        .status(400)
                        .json({ error: "You are replying to a message that doesn't exist!" });
                }
            }
            const typeOfFile = file === null || file === void 0 ? void 0 : file.mimetype.split("/")[0];
            if (typeOfFile === "video") {
                return res
                    .status(400)
                    .json({ error: "Video files are currently not supported!" });
            }
            let uploadResult;
            // save the file to cloudinary
            if (!fileObj && file) {
                const b64 = Buffer.from(file.buffer).toString("base64");
                const dataURI = "data:" + file.mimetype + ";base64," + b64;
                if (typeOfFile === "image") {
                    uploadResult = yield (0, utils_1.uploadFile)(dataURI);
                }
                else if (typeOfFile === "audio") {
                    uploadResult = yield (0, utils_1.uploadFile)(dataURI, "video");
                }
                else {
                    uploadResult = yield (0, utils_1.uploadFile)(dataURI, "raw");
                }
            }
            // save the message in db
            const newMessage = new messageModel_1.default({
                senderId: userId,
                receiverId: [receiverId],
                replyingTo: replyingTo ? new mongoose_1.default.Types.ObjectId(replyingTo) : null,
                content: message ? message : null,
                // save the file info if exists
                file: uploadResult
                    ? {
                        public_id: uploadResult.public_id,
                        name: file === null || file === void 0 ? void 0 : file.originalname,
                        size: uploadResult.bytes,
                        url: uploadResult.secure_url,
                    }
                    : fileObj
                        ? JSON.parse(fileObj)
                        : null,
                status: "sent",
                type: uploadResult
                    ? uploadResult.resource_type
                    : fileObj
                        ? fileType
                        : "text",
                mimeType: uploadResult ? file === null || file === void 0 ? void 0 : file.mimetype : null,
            });
            yield newMessage.save();
            const isAlreadyFriend = yield friendModel_1.default.aggregate([
                {
                    $match: {
                        userId: new mongoose_1.default.Types.ObjectId(userId),
                        friendsId: new mongoose_1.default.Types.ObjectId(receiverId),
                    },
                },
            ]);
            // if not already friends, add to friend list in both user and receiver
            if (isAlreadyFriend.length === 0) {
                const user = yield (0, utils_1.getFriends)(userId);
                const receiver = yield (0, utils_1.getFriends)(receiverId);
                const recieverID = new mongoose_1.default.Types.ObjectId(receiverId);
                const userID = new mongoose_1.default.Types.ObjectId((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
                if (user) {
                    user.friendsId.push(recieverID);
                    yield user.save();
                }
                else {
                    yield friendModel_1.default.create({ userId, friendsId: [recieverID] });
                }
                if (receiver) {
                    receiver.friendsId.push(userID);
                    yield receiver.save();
                }
                else {
                    yield friendModel_1.default.create({ userId: receiverId, friendsId: [userID] });
                }
            }
            res.status(201).json({ data: newMessage });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({
                error: "Something went wrong while sending the message, please try again!",
            });
        }
    });
}
exports.sendMessage = sendMessage;
function editMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Message is required!" });
        }
        try {
            const message = yield messageModel_1.default.findById(id);
            if (!message) {
                return res.status(404).json({ error: "Message doesn't exist!" });
            }
            if (message.senderId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
                return res
                    .status(400)
                    .json({ error: "You are not allow to edit this message!" });
            }
            message.content = content;
            message.edited = true;
            yield message.save();
            const updatedMessage = yield messageModel_1.default.findById(message._id, { __v: 0 });
            return res.status(200).json({ data: updatedMessage });
        }
        catch (err) {
            console.log(err);
            return res.status(400).json({ error: "Something went wrong!" });
        }
    });
}
exports.editMessage = editMessage;
function deleteMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        try {
            const message = yield messageModel_1.default.findById(id);
            if (!message) {
                return res.status(404).json({ error: "Message not found!" });
            }
            // only the sender can delete the message
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) !== message.senderId.toString()) {
                return res
                    .status(401)
                    .json({ error: "You are not allowed to delete this message!" });
            }
            // delete file content from cloudinary if any
            if (message.file) {
                yield cloudinary_1.default.uploader.destroy(message.file.public_id);
            }
            yield message.deleteOne();
            return res.sendStatus(204);
        }
        catch (err) {
            console.log(err);
            return res.status(400).json({ error: "Something went wrong!" });
        }
    });
}
exports.deleteMessage = deleteMessage;
// Reactions
function addReaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!emoji) {
            return res.status(400).json({ error: "Emoji is required!" });
        }
        try {
            const message = yield messageModel_1.default.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: "Message doesn't exist!" });
            }
            if (!message.reactions.get(emoji)) {
                message.reactions.set(emoji, []);
            }
            let originalReaction = null;
            for (const reaction of message.reactions.keys()) {
                if ((_b = message.reactions.get(reaction)) === null || _b === void 0 ? void 0 : _b.includes(userId)) {
                    if (reaction === emoji) {
                        return res.status(400).json({ error: "Already gave reaction!" });
                    }
                    else {
                        message.reactions.set(reaction, message.reactions
                            .get(reaction)
                            .filter((id) => id.toString() !== userId.toString()));
                        originalReaction = reaction;
                        break;
                    }
                }
            }
            message.reactions.get(emoji).push(userId);
            yield message.save();
            return res.status(200).json({
                data: {
                    reaction: emoji,
                    originalReaction,
                },
            });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({
                error: "Something went wrong while sending the message, please try again!",
            });
        }
    });
}
exports.addReaction = addReaction;
function removeReaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { messageId } = req.params;
        const { emoji } = req.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!emoji) {
            return res.status(400).json({ error: "Emoji is required!" });
        }
        try {
            const message = yield messageModel_1.default.findById(messageId);
            if (!message) {
                return res.status(404).json({ error: "Message doesn't exist!" });
            }
            const existingReaction = message.reactions.get(emoji);
            if (!existingReaction) {
                return res.status(400).json({ error: "No reaction to remove!" });
            }
            message.reactions.set(emoji, existingReaction.filter((id) => id.toString() !== userId.toString()));
            yield message.save();
            return res.status(200).json({ data: { emoji } });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({
                error: "Something went wrong while sending the message, please try again!",
            });
        }
    });
}
exports.removeReaction = removeReaction;
function getReactions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { messageId } = req.params;
        try {
            const message = yield messageModel_1.default.findById(messageId);
            if (!message) {
                return res.status(400).json({ error: "Message does not exist!" });
            }
            // get all of the users id who reacted the message
            const userIds = [...message.reactions.values()].flatMap((id) => id);
            if (userIds.length === 0) {
                return res.status(200).json({ data: {}, message: "No reactions" });
            }
            // find all of the users with those ids
            const users = yield userModel_1.default.find({ _id: { $in: userIds } }, {
                created_at: 0,
                password: 0,
                provider: 0,
                updated_at: 0,
                __v: 0,
            });
            // create a users map for easy lookup
            const usersMap = new Map();
            users.forEach((user) => {
                usersMap.set(user._id.toString(), user);
            });
            const reactions = {};
            for (const [emoji, ids] of message.reactions) {
                if (ids.length > 0) {
                    reactions[emoji] = ids
                        .map((id) => usersMap.get(id.toString()))
                        .filter((user) => user !== undefined);
                }
            }
            res.status(200).json({ data: reactions });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({
                error: "Something went wrong while sending the message, please try again!",
            });
        }
    });
}
exports.getReactions = getReactions;
function getChats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            let chats = [];
            const friends = yield (0, utils_1.getFriends)(new mongoose_1.default.Types.ObjectId(userId));
            if (!friends) {
                return res
                    .status(200)
                    .json({ data: chats, message: "You currently have no chats!" });
            }
            for (const id of friends.friendsId) {
                const latestMessage = yield messageModel_1.default.find({
                    $or: [
                        { senderId: userId, receiverId: id },
                        { senderId: id, receiverId: userId },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .limit(1);
                const friend = yield userModel_1.default.findById(id, {
                    _id: 1,
                    name: 1,
                    email: 1,
                    avatar: 1,
                    isOnline: 1,
                    lastOnline: 1,
                });
                chats.push({
                    latestMessage: latestMessage[0].content,
                    latestTime: latestMessage[0].createdAt,
                    otherUser: friend,
                    latestMessageStatus: latestMessage[0].status,
                    latestMessageSenderId: latestMessage[0].senderId,
                    latestMessageType: latestMessage[0].type,
                });
            }
            return res.status(200).json({ data: chats });
        }
        catch (err) {
            console.log(err);
            res.status(400).json({ error: "Something went wrong! Please try again!" });
        }
    });
}
exports.getChats = getChats;
