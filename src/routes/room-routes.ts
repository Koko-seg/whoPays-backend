import express from "express";
import { getRoomByCode } from "../controller/room/getRoomByCode.controller";
import { createRoom } from "../controller/room/createRoom.controller";


const roomRouter = express.Router();

roomRouter.post("/", createRoom);
roomRouter.get("/:code", getRoomByCode);


export default roomRouter;