import { Server, Socket } from "socket.io";
import { roomHandlers } from "./roomHandlers";


export function registerSocketHandlers(io: Server) {
io.on("connection", (socket) => {
  socket.on("host:start_game", ({ roomCode, gameType }) => {
    console.log(`Game started: ${gameType} in room ${roomCode}`);
    io.to(roomCode).emit("game_started", { roomCode, gameType });
  });
});
}
