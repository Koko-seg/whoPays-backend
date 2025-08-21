import express from "express";
import { getRoomByCode } from "../controller/room/getRoomByCode.controller";
import { createRoom } from "../controller/room/createRoom.controller";
import { checkRoomName } from "../controller/room/checkRoomName.controller";
import { checkNicknameInRoom } from "../controller/room/checkNicknameInRoom.controller";
import { addParticipantToRoom } from "../controller/room/addParticipantToRoom.controller";
import { removeParticipantFromRoom } from "../controller/room/removeParticipantFromRoom.controller";

const roomRouter = express.Router();

//* Check room name uniqueness
roomRouter.post("/check-name", checkRoomName);

//* Create room
roomRouter.post("/", createRoom);

//* Get room details by code
roomRouter.get("/:code", getRoomByCode);


//* Check nickname availability in room


roomRouter.post("/:roomCode/check-nickname", checkNicknameInRoom);

//* Add participant to room
roomRouter.post("/:roomCode/participants", addParticipantToRoom);

//* Remove participant from room
roomRouter.delete("/:roomCode/participants/:participantId", removeParticipantFromRoom);


export default roomRouter;