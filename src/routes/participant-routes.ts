import express from "express";
import { createplayer } from "../controller/participant/createParticipant.controller";



const playerRouters = express.Router();

playerRouters.post("/", createplayer);
// playerRouter.get("/:code", getplayerById);


export default playerRouters;