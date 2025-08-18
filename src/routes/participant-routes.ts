import express from "express";
import { createParticipant } from "../controller/participant/createParticipant.controller";


const participantRoutes = express.Router();

participantRoutes.post("/join", createParticipant);
// participantRouter.get("/:code", getParticipantById);


export default participantRoutes;