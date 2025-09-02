"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
// routes
const room_routes_1 = __importDefault(require("./routes/room-routes"));
const excuse_with_roast_1 = __importDefault(require("./routes/excuse-with-roast"));
const admin_routes_1 = __importDefault(require("./routes/admin-routes"));
const _socketHandlers_1 = require("./sockets/ socketHandlers");
const participant_routes_1 = __importDefault(require("./routes/participant-routes"));
const app = (0, express_1.default)();
const PORT = 4200;
app.use((0, cors_1.default)({ origin: "http://localhost:3000" }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// REST endpoints
app.use("/roast", excuse_with_roast_1.default);
app.use("/room", room_routes_1.default);
app.use("/player", participant_routes_1.default);
app.use("/admin", admin_routes_1.default);
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "http://localhost:3000" },
});
// Register all socket events
(0, _socketHandlers_1.registerSocketHandlers)(io);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
