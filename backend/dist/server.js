"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname.replace("\\dist", ""), "../.env"),
});
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const passport_2 = __importDefault(require("./config/passport"));
const index_1 = require("./sockets/index");
// import multerErrorMiddleware from "./middlewares/multerMiddleware";
// Connect to db
// connectToDB();
// Middlewares
index_1.app.use(body_parser_1.default.urlencoded({ extended: true }));
index_1.app.use(body_parser_1.default.json());
index_1.app.use((0, cors_1.default)({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));
index_1.app.use((0, cookie_parser_1.default)());
index_1.app.use(passport_1.default.initialize());
// port
const port = process.env.PORT || 3000;
// passport setup
(0, passport_2.default)();
// Api routes
index_1.app.use("/api/v1/auth", authRoutes_1.default);
index_1.app.use("/api/v1/users", userRoutes_1.default);
index_1.app.use("/api/v1/messages", messageRoutes_1.default);
//  For deployments
index_1.app.use(express_1.default.static(path_1.default.join(path_1.default.resolve(), "/frontend/dist")));
index_1.app.get("*", (req, res) => {
    if (process.env.NODE_ENV === "development") {
        res.sendFile(path_1.default.resolve(__dirname, "../frontend/dist/index.html"));
    }
    else {
        res.sendFile(path_1.default.resolve(__dirname, "../../frontend/dist/index.html"));
    }
});
if (process.env.NODE_ENV === "development") {
    // Error and not found middleware
    index_1.app.use(errorMiddleware_1.notFound);
    index_1.app.use(errorMiddleware_1.errorHandler);
}
index_1.server.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});
exports.default = index_1.server;
