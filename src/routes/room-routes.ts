import express from "express";
import {  JoinRoomByCode } from "../controller/room/joinRoomByCode.controller";
import { createRoom } from "../controller/room/createRoom.controller";
import { getRoomById } from "../controller/room/getRoomById";


const roomRouter = express.Router();

roomRouter.post("/", createRoom);
roomRouter.get("/:code", JoinRoomByCode);
roomRouter.get("/get/:id", getRoomById);


export default roomRouter;