import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";

// routes
import roomRouter from "./routes/room-routes";
import excuseRoutes from "./routes/excuse-with-roast";

import { registerSocketHandlers } from "./sockets/ socketHandlers";
import playerRouters from "./routes/participant-routes";

const app = express();
const PORT = 4200;

const allowedOrigins = [
  "http://localhost:3000",
  "https://lucky-bites.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST endpoints
app.use("/roast", excuseRoutes);
app.use("/room", roomRouter);
app.use("/player", playerRouters);

const httpServer = createServer(app);

const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:3000" },
});

// Register all socket events
registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
