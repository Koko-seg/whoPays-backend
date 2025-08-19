import express from "express";


import { getRoomMessages } from "../controller/excuse/getExcuse.controller";
import { triggerRoomRoast } from "../controller/excuse/createExcuse.controller";

const excuseRoutes = express.Router();

excuseRoutes.post("/", triggerRoomRoast);
excuseRoutes.get("/messages", getRoomMessages);

export default excuseRoutes;
