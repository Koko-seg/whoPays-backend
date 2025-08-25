"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const room_routes_1 = __importDefault(require("./routes/room-routes"));
const player_routes_1 = __importDefault(require("./routes/player-routes"));
const excuse_with_roast_1 = __importDefault(require("./routes/excuse-with-roast"));
const admin_routes_1 = __importDefault(require("./routes/admin-routes"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const spin_whell_controller_1 = require("./controller/spin-whell.controller");
const prisma_1 = __importDefault(require("./utils/prisma"));
const app = (0, express_1.default)();
const PORT = 4200;
app.use((0, cors_1.default)({ origin: "http://localhost:3000" }));
app.use(express_1.default.json());
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "http://localhost:3000" },
});
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/roast", excuse_with_roast_1.default);
app.use("/spin", spin_whell_controller_1.spinWheel);
app.use("/room", room_routes_1.default);
app.use("/player", player_routes_1.default);
app.use("/admin", admin_routes_1.default);
//* Option list shared between all clients
let wheelData = [
    { option: "Prize 1" },
    { option: "Prize 2" },
    { option: "Prize 3" },
    { option: "Prize 4" },
];
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    //* Send current wheel data to client
    socket.emit("updateWheel", wheelData);
    //* Spin event
    socket.on("spin", () => {
        const prizeNumber = Math.floor(Math.random() * wheelData.length);
        io.emit("spinResult", { prizeNumber, option: wheelData[prizeNumber] });
    });
    //* Add new option
    socket.on("addOption", (option) => {
        wheelData.push({ option });
        io.emit("updateWheel", wheelData);
    });
    //* Remove option
    socket.on("removeOption", (index) => {
        wheelData.splice(index, 1);
        io.emit("updateWheel", wheelData);
    });
    //* Select game
    socket.on("selectGame", async (game) => {
        console.log(`User ${socket.id} selected game:`, game);
        await prisma_1.default.room.update({
            where: { id: parseInt(game.id) },
            data: { gameType: game.name },
        });
        //* Broadcast to all other clients except the sender
        socket.broadcast.emit("gameSelected", game);
    });
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
