import express from "express";
import cors from "cors";
import { spinWheel } from "./controller/spin-whell.controller";
import roomRouter from "./routes/room-routes";

import participantRoutes from "./routes/participant-routes";

import excuseRoutes from "./routes/excuse-with-roast";

const app = express();
const PORT = 4200;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/roast", excuseRoutes);

app.use("/spin", spinWheel);

app.use("/room", roomRouter);

app.use("/participant", participantRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
