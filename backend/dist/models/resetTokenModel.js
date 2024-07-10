"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const resetTokenSchema = new mongoose_1.Schema({
    email: {
        type: String,
        unique: true,
    },
    token: {
        type: String,
        unique: true,
    },
    expiresAt: Date,
    created_at: {
        type: Date,
        default: Date.now,
    },
});
const ResetToken = (0, mongoose_1.model)("Reset Token", resetTokenSchema);
exports.default = ResetToken;
