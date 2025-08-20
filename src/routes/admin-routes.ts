import express from "express";
import adminAuth from "../middleware/adminAuth";
import { listRooms } from "../controller/admin/listRooms.controller";
import { deleteRoomByCode } from "../controller/admin/deleteRoom.controller";

const adminRouter = express.Router();

adminRouter.use(adminAuth);

adminRouter.get("/rooms", listRooms);
adminRouter.delete("/rooms/:roomCode", deleteRoomByCode);

export default adminRouter;
