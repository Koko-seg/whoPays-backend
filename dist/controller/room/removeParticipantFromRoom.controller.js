"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeParticipantFromRoom = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const removeParticipantFromRoom = async (req, res) => {
    try {
        const { roomCode, participantId } = req.params;
        if (!roomCode || roomCode.length !== 5) {
            return res.status(400).json({ message: "Зөв өрөөний код оруулна уу (5 орон)" });
        }
        if (!participantId || isNaN(Number(participantId))) {
            return res.status(400).json({ message: "Зөв participant ID оруулна уу" });
        }
        // Өрөө байгаа эсэхийг шалгана
        const room = await prisma_1.default.room.findUnique({
            where: { code: roomCode },
            include: {
                participants: true,
            },
        });
        if (!room) {
            return res.status(404).json({ message: "Room does not exist" });
        }
        // Тоглоом эхэлсэн бол participant устгаж болохгүй
        if (room.gamestatus !== "PENDING") {
            return res.status(400).json({ message: "Cannot remove participant: game already started" });
        }
        // Participant байгаа эсэх, тухайн өрөөнд харьяалагдаж байгаа эсэхийг шалгана
        const participant = await prisma_1.default.participant.findFirst({
            where: {
                id: Number(participantId),
                roomId: room.id,
            },
        });
        if (!participant) {
            return res.status(404).json({ message: "Participant not found in this room" });
        }
        // Host бол устгаж болохгүй
        if (participant.isHost) {
            return res.status(400).json({ message: "Cannot remove host participant" });
        }
        // Participant-г устгана
        await prisma_1.default.participant.delete({
            where: { id: Number(participantId) },
        });
        return res.status(200).json({
            message: "Participant removed successfully",
            participantId: Number(participantId),
        });
    }
    catch (err) {
        console.error("Participant устгахад алдаа гарлаа:", err);
        return res
            .status(500)
            .json({ message: "Серверийн алдаа гарлаа", error: err.message });
    }
};
exports.removeParticipantFromRoom = removeParticipantFromRoom;
