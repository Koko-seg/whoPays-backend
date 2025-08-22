"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRooms = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const listRooms = async (req, res) => {
    try {
        const rooms = await prisma_1.default.room.findMany({
            include: { participants: true, results: true, message: true },
        });
        return res.status(200).json({ rooms });
    }
    catch (err) {
        console.error("listRooms алдаа:", err);
        return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
    }
};
exports.listRooms = listRooms;
