"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkFormData(req, res, next) {
    const data = req.body;
    if (Object.keys(data).length === 0) {
        throw new Error("You must provide the required data.");
    }
    else if (Object.values(data).some((field) => field === "")) {
        throw new Error("Please fill in every required fields.");
    }
    else {
        next();
    }
}
exports.default = checkFormData;
