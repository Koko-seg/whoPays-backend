"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getRoomByCode_controller_1 = require("../controller/room/getRoomByCode.controller");
const createRoom_controller_1 = require("../controller/room/createRoom.controller");
const JoinRoom_controller_1 = require("../controller/room/JoinRoom.controller");
const removeParticipantFromRoom_controller_1 = require("../controller/room/removeParticipantFromRoom.controller");
const roomRouter = express_1.default.Router();
//* Create room
roomRouter.post("/", createRoom_controller_1.createRoom);
//* Get room details by code
roomRouter.get("/:code", getRoomByCode_controller_1.getRoomByCode);
//* Add player to room
roomRouter.post("/:roomCode/player", JoinRoom_controller_1.addplayerToRoom);
//* Remove player from room
roomRouter.delete("/:roomCode/player/:playerId", removeParticipantFromRoom_controller_1.removeplayerFromRoom);
exports.default = roomRouter;
