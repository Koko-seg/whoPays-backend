import express from "express";
import { createRoom } from "../controller/room.controller";
import { getRoomByCode } from "../controller/getRoomByCode.controller";

const roomRouter = express.Router();

roomRouter.post("/", createRoom);
roomRouter.get("/:code", getRoomByCode);

export default roomRouter;
