"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParticipant = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createParticipant = async (req, res) => {
    try {
        const { roomCode, participantName } = req.body; // Хүсэлтээс өрөөний код болон тоглогчийн нэрийг авна
        // Оролтын утгуудыг шалгана
        if (!roomCode || typeof roomCode !== "string" || roomCode.trim() === "") {
            return res.status(400).json({ message: "Өрөөний кодыг оруулна уу." });
        }
        if (!participantName ||
            typeof participantName !== "string" ||
            participantName.trim() === "") {
            return res.status(400).json({ message: "Тоглогчийн нэрийг оруулна уу." });
        }
        // Өрөөг кодоор нь хайна
        const room = await prisma_1.default.room.findUnique({
            where: { code: roomCode.trim() },
            include: {
                participants: true, // Өрөөний тоглогчдыг хамт татна
            },
        });
        // Хэрэв өрөө олдсон эсэхийг шалгана
        if (!room) {
            return res
                .status(404)
                .json({ message: "Өрөө олдсонгүй. Кодоо шалгана уу." });
        }
        // Ижил нэртэй тоглогч тухайн өрөөнд байгаа эсэхийг шалгана (нэр давхардлаас сэргийлнэ)
        const existingParticipant = room.participants.find((p) => p.name.toLowerCase() === participantName.trim().toLowerCase());
        // if (existingParticipant) {
        //   // Хэрэв ижил нэртэй тоглогч байвал тэр тоглогчийг буцаана
        //   return res.status(200).json({
        //     message: "Та аль хэдийн энэ өрөөнд ижил нэрээр нэгдсэн байна.",
        //     room: {
        //       id: room.id,
        //       name: room.roomName,
        //       code: room.code,
        //     },
        //     participant: {
        //       id: existingParticipant.id,
        //       name: existingParticipant.name,
        //     },
        //   });
        // }
        // Шинэ тоглогчийг өгөгдлийн санд үүсгэнэ
        const newParticipant = await prisma_1.default.participant.create({
            data: {
                name: participantName.trim(),
                roomId: room.id, // Олдсон өрөөний ID-аар холбоно
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        });
        // Амжилттай нэгдсэн хариуг буцаана
        return res.status(201).json({
            message: "Өрөөнд амжилттай нэгдлээ!",
            room: {
                id: room.id,
                name: room.roomName,
                code: room.code,
            },
            participant: newParticipant,
        });
    }
    catch (err) {
        console.error("Өрөөнд нэгдэхэд алдаа гарлаа:", err);
        return res
            .status(500)
            .json({ message: "Серверийн дотоод алдаа гарлаа.", error: err.message });
    }
};
exports.createParticipant = createParticipant;
