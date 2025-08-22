"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomMessages = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getRoomMessages = async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        if (!roomId)
            return res.status(400).json({ message: "roomId буруу" });
        const messages = await prisma_1.default.message.findMany({
            where: { roomId },
            orderBy: { createdAt: "desc" },
        });
        return res.json({ success: true, messages });
    }
    catch (e) {
        console.error("getRoomMessages error:", e);
        return res
            .status(500)
            .json({ success: false, message: "Server error", error: e.message });
    }
};
exports.getRoomMessages = getRoomMessages;
