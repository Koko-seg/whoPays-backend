import express from "express";

import { createReasonsWithRoast } from "../controller/excuse/createExcuse.controller";
import { getRoomMessages } from "../controller/excuse/getExcuse.controller";

const excuseRoutes = express.Router();

excuseRoutes.post("/", createReasonsWithRoast);
excuseRoutes.get("/messages", getRoomMessages);

export default excuseRoutes;
