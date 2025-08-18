import express from "express";
import cors from "cors";
import { roastReason } from "./controller/reason.controller";
import { spinWheel } from "./controller/spin-whell.controller";
import roomRouter from "./routes/room-routes";
import participantRouter from "./routes/participant-routes";
import participantRoutes from "./routes/participant-routes";

const app = express();
const PORT = 4200;

app.use(cors());

// JSON болон URL-encoded өгөгдлийг parse хийх middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API route
app.post("/roast", roastReason);

app.post("/spin", spinWheel);

app.use("/room", roomRouter);

app.use("/participant", participantRoutes) 

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
