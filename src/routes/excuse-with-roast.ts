import express from "express";

import { triggerRoomRoast } from "../controller/excuse/createExcuse.controller";

const excuseRoutes = express.Router();

excuseRoutes.post("/", triggerRoomRoast);

export default excuseRoutes;
