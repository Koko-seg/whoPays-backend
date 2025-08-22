"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getRoomByCode_controller_1 = require("../controller/room/getRoomByCode.controller");
const createRoom_controller_1 = require("../controller/room/createRoom.controller");
const checkRoomName_controller_1 = require("../controller/room/checkRoomName.controller");
const checkNicknameInRoom_controller_1 = require("../controller/room/checkNicknameInRoom.controller");
const addParticipantToRoom_controller_1 = require("../controller/room/addParticipantToRoom.controller");
const removeParticipantFromRoom_controller_1 = require("../controller/room/removeParticipantFromRoom.controller");
const roomRouter = express_1.default.Router();
//* Check room name uniqueness
roomRouter.post("/check-name", checkRoomName_controller_1.checkRoomName);
//* Create room
roomRouter.post("/", createRoom_controller_1.createRoom);
//* Get room details by code
roomRouter.get("/:code", getRoomByCode_controller_1.getRoomByCode);
//* Check nickname availability in room
roomRouter.post("/:roomCode/check-nickname", checkNicknameInRoom_controller_1.checkNicknameInRoom);
//* Add participant to room
roomRouter.post("/:roomCode/participants", addParticipantToRoom_controller_1.addParticipantToRoom);
//* Remove participant from room
roomRouter.delete("/:roomCode/participants/:participantId", removeParticipantFromRoom_controller_1.removeParticipantFromRoom);
exports.default = roomRouter;
