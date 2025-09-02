import express from "express";
import adminAuth from "../middleware/adminAuth";

const adminRouter = express.Router();

adminRouter.use(adminAuth);

export default adminRouter;
