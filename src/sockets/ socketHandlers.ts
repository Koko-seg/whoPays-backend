import { Server, Socket } from "socket.io";
import { roomHandlers } from "./roomHandlers";
 
 
export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);
 
    // register different socket logic
    roomHandlers(io, socket);
  
 
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  
}
 