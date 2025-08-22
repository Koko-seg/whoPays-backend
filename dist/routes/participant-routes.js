"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const createParticipant_controller_1 = require("../controller/participant/createParticipant.controller");
const participantRoutes = express_1.default.Router();
participantRoutes.post("/", createParticipant_controller_1.createParticipant);
// participantRouter.get("/:code", getParticipantById);
exports.default = participantRoutes;
