import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";


// routes
import roomRouter from "./routes/room-routes";
import excuseRoutes from "./routes/excuse-with-roast";
import adminRouter from "./routes/admin-routes";
import { registerSocketHandlers } from "./sockets/ socketHandlers";
import { initVoteGame } from "./controller/init.vote.game";
import playerRouters from "./routes/participant-routes";


const app = express();
const PORT = 4200;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST endpoints
app.use("/roast", excuseRoutes);
app.use("/room", roomRouter);
app.use("/player", playerRouters);
app.use("/admin", adminRouter);

const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

// Register all socket events
registerSocketHandlers(io);

initVoteGame(io);
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
