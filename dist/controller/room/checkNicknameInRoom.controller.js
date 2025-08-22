"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNicknameInRoom = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const checkNicknameInRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { nickname } = req.body;
        if (!roomCode || roomCode.length !== 5) {
            return res.status(400).json({ message: "Зөв өрөөний код оруулна уу (5 орон)" });
        }
        if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
            return res.status(400).json({ message: "Nickname оруулна уу." });
        }
        // Өрөө байгаа эсэхийг шалгана
        const room = await prisma_1.default.room.findUnique({
            where: { code: roomCode },
        });
        if (!room) {
            return res.status(404).json({ message: "Room does not exist" });
        }
        // Тухайн өрөөнд nickname давтагдсан эсэхийг шалгана
        const existingParticipant = await prisma_1.default.participant.findUnique({
            where: {
                roomId_name: {
                    roomId: room.id,
                    name: nickname.trim(),
                },
            },
        });
        if (existingParticipant) {
            return res.status(409).json({ message: "Nickname already taken in this room" });
        }
        return res.status(200).json({ message: "Nickname is available" });
    }
    catch (err) {
        console.error("Nickname шалгахад алдаа гарлаа:", err);
        return res
            .status(500)
            .json({ message: "Серверийн алдаа гарлаа", error: err.message });
    }
};
exports.checkNicknameInRoom = checkNicknameInRoom;
