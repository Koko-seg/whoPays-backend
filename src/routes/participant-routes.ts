import express from "express";
import { createParticipant } from "../controller/participant/createParticipant.controller";


const participantRoutes = express.Router();

participantRoutes.post("/", createParticipant);
// participantRouter.get("/:code", getParticipantById);


export default participantRoutes;