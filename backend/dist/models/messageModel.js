"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    senderId: { type: mongoose_1.Types.ObjectId, ref: "User", required: true },
    receiverId: [{ type: mongoose_1.Types.ObjectId, ref: "User", required: true }],
    replyingTo: {
        type: mongoose_1.Types.ObjectId,
        ref: "Message",
        required: false,
        default: null,
    },
    content: { type: String, required: false, default: null },
    file: {
        type: new mongoose_1.Schema({
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            size: {
                type: Number,
                required: true,
            },
        }),
        default: null,
    },
    status: { type: String, required: true, default: "sent" },
    reactions: {
        type: Map,
        of: [mongoose_1.Types.ObjectId],
        unique: true,
        default: {},
    },
    type: { type: String, default: null, required: false },
    mimeType: { type: String, default: null, required: false },
    edited: { type: Boolean, default: false, required: false },
}, { timestamps: true });
const Message = (0, mongoose_1.model)("Message", messageSchema);
exports.default = Message;
