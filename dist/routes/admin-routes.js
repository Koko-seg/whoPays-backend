"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminAuth_1 = __importDefault(require("../middleware/adminAuth"));
const listRooms_controller_1 = require("../controller/admin/listRooms.controller");
const deleteRoom_controller_1 = require("../controller/admin/deleteRoom.controller");
const adminRouter = express_1.default.Router();
adminRouter.use(adminAuth_1.default);
adminRouter.get("/rooms", listRooms_controller_1.listRooms);
adminRouter.delete("/rooms/:roomCode", deleteRoom_controller_1.deleteRoomByCode);
exports.default = adminRouter;
