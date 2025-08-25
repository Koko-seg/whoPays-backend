"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createplayer_controller_1 = require("../controller/player/createplayer.controller");
const playerRoutes = express_1.default.Router();
playerRoutes.post("/", createplayer_controller_1.createplayer);
// playerRouter.get("/:code", getplayerById);
exports.default = playerRoutes;
