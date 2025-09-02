"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const roomHandlers_1 = require("./roomHandlers");
function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        // register different socket logic
        (0, roomHandlers_1.roomHandlers)(io, socket);
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}
