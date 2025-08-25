"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoomByCode = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const deleteRoomByCode = async (req, res) => {
    try {
        const { roomCode } = req.params;
        if (!roomCode || !/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ message: "Зөв 5 оронтой код оруулна уу" });
        }
        const room = await prisma_1.default.room.findUnique({ where: { code: roomCode } });
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        // First delete player, results, messages if cascade not configured
        await prisma_1.default.player.deleteMany({ where: { roomId: room.id } });
        await prisma_1.default.result.deleteMany({ where: { roomId: room.id } });
        await prisma_1.default.message.deleteMany({ where: { roomId: room.id } });
        await prisma_1.default.room.delete({ where: { id: room.id } });
        return res.status(200).json({ message: "Room deleted" });
    }
    catch (err) {
        console.error("deleteRoomByCode алдаа:", err);
        return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
    }
};
exports.deleteRoomByCode = deleteRoomByCode;
