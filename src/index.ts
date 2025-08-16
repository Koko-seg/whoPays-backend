import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { roastReason } from "./controller/reason.controller";
import { spinWheel } from "./controller/spin-whell.controller";
import { createRoom } from "./controller/room.controller";
import roomRouter from "./router/room.router";

const app = express();
const PORT = 4200;

app.use(cors());

app.use(bodyParser.json());

// API route
app.post("/roast", roastReason);

app.post("/spin", spinWheel);

app.use("/room", roomRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
