import express from "express";
import cors from "cors";
import roomRouter from "./routes/room-routes";
import participantRoutes from "./routes/participant-routes";
import excuseRoutes from "./routes/excuse-with-roast";
import adminRouter from "./routes/admin-routes";

import { createServer } from "http";
import { Server } from "socket.io";
import { Server as IOServer } from "socket.io";
import { spinWheel } from "./controller/spin-whell.controller";


import prisma from "./utils/prisma";

const app = express();
const PORT = 4200;

app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());

const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

app.use(express.urlencoded({ extended: true }));

app.use("/roast", excuseRoutes);

app.use("/spin", spinWheel);

app.use("/room", roomRouter);

app.use("/participant", participantRoutes);

app.use("/admin", adminRouter);


//* Option list shared between all clients
let wheelData: { option: string }[] = [
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
  socket.on("addOption", (option: string) => {
    wheelData.push({ option });
    io.emit("updateWheel", wheelData);
  });

  //* Remove option
  socket.on("removeOption", (index: number) => {
    wheelData.splice(index, 1);
    io.emit("updateWheel", wheelData);
  });

  //* Select game
  socket.on("selectGame", async (game: { id: string; name: string }) => {
    console.log(`User ${socket.id} selected game:`, game);

    await prisma.room.update({
      where: { id: parseInt(game.id) },
      data: { gameType: game.name as any },
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



