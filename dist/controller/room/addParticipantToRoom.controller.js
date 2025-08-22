"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addParticipantToRoom = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const MAX_PARTICIPANTS = 10;
const addParticipantToRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { nickname } = req.body;
        if (!roomCode || roomCode.length !== 5) {
            return res.status(400).json({ message: "Зөв өрөөний код оруулна уу (5 орон)" });
        }
        if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
            return res.status(400).json({ message: "Nickname оруулна уу." });
        }
        // Өрөө байгаа эсэх, тоглоом эхэлсэн эсэхийг шалгана
        const room = await prisma_1.default.room.findUnique({
            where: { code: roomCode },
            include: {
                participants: true,
            },
        });
        if (!room) {
            return res.status(404).json({ message: "Room does not exist" });
        }
        if (room.gamestatus !== "PENDING") {
            return res.status(400).json({ message: "Cannot join room: game already started" });
        }
        if (room.participants.length >= MAX_PARTICIPANTS) {
            return res.status(400).json({ message: "Room is full" });
        }
        // Nickname давтагдсан эсэхийг шалгана
        const existingParticipant = room.participants.find((p) => p.name.toLowerCase() === nickname.trim().toLowerCase());
        if (existingParticipant) {
            return res.status(409).json({ message: "Nickname already taken" });
        }
        // Шинэ participant үүсгэнэ
        const newParticipant = await prisma_1.default.participant.create({
            data: {
                name: nickname.trim(),
                roomId: room.id,
                isHost: false,
            },
        });
        return res.status(201).json({
            participantId: newParticipant.id,
            message: "Participant added successfully",
        });
    }
    catch (err) {
        console.error("Participant нэмэхэд алдаа гарлаа:", err);
        return res
            .status(500)
            .json({ message: "Серверийн алдаа гарлаа", error: err.message });
    }
};
exports.addParticipantToRoom = addParticipantToRoom;
