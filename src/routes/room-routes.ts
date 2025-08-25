import express from "express";
import { getRoomByCode } from "../controller/room/getRoomByCode.controller";
import { createRoom } from "../controller/room/createRoom.controller";

import { addplayerToRoom } from "../controller/room/JoinRoom.controller";
import { removeplayerFromRoom } from "../controller/room/removeParticipantFromRoom.controller";


const roomRouter = express.Router();


//* Create room
roomRouter.post("/", createRoom);

//* Get room details by code
roomRouter.get("/:code", getRoomByCode);

//* Add player to room
roomRouter.post("/:roomCode/player", addplayerToRoom);

//* Remove player from room
roomRouter.delete("/:roomCode/player/:playerId", removeplayerFromRoom);


export default roomRouter;