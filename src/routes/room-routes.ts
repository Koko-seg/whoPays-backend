import express from "express";
import { getRoomByCode } from "../controller/room/getRoomByCode.controller";
import { createRoom } from "../controller/room/createRoom.controller";

import { addplayerToRoom } from "../controller/room/JoinRoom.controller";

const roomRouter = express.Router();

//* Create room
roomRouter.post("/", createRoom);

//* Get room details by code
roomRouter.get("/:code", getRoomByCode);

//* Add player to room
roomRouter.post("/:roomCode/player", addplayerToRoom);

export default roomRouter;
