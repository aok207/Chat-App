"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const friendSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, unique: true },
    friendsId: [
        {
            type: mongoose_1.Types.ObjectId,
        },
    ],
});
const Friend = (0, mongoose_1.model)("Friend", friendSchema);
exports.default = Friend;
