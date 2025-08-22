"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const getExcuse_controller_1 = require("../controller/excuse/getExcuse.controller");
const createExcuse_controller_1 = require("../controller/excuse/createExcuse.controller");
const excuseRoutes = express_1.default.Router();
excuseRoutes.post("/", createExcuse_controller_1.triggerRoomRoast);
excuseRoutes.get("/messages", getExcuse_controller_1.getRoomMessages);
exports.default = excuseRoutes;
