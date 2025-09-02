"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createParticipant_controller_1 = require("../controller/participant/createParticipant.controller");
const playerRouters = express_1.default.Router();
playerRouters.post("/", createParticipant_controller_1.createplayer);
// playerRouter.get("/:code", getplayerById);
exports.default = playerRouters;
