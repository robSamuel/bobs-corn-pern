"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const corn_routes_1 = __importDefault(require("./routes/corn.routes"));
const is_docker_1 = __importDefault(require("is-docker"));
const init_1 = require("./db/init");
const socket_1 = require("./socket");
const PORT = 3000;
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const host = (0, is_docker_1.default)() ? 'express-api' : 'localhost';
// Trust proxy for accurate IP addresses in Docker/behind proxies
app.set('trust proxy', true);
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", //allow cors coming from frontend
    methods: ["GET", "POST"],
}));
app.use(express_1.default.json());
app.use("/", corn_routes_1.default);
// Initialize Socket.io
(0, socket_1.initializeSocket)(httpServer);
// Initialize database and start server
async function startServer() {
    try {
        await (0, init_1.initializeDatabase)();
        httpServer.listen(PORT, () => console.log(`Backend ready as ${host} in port: ${PORT}`));
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
