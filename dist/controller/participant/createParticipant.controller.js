"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createplayer = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createplayer = async (req, res) => {
    try {
        const { roomCode, playerName } = req.body; // Хүсэлтээс өрөөний код болон тоглогчийн нэрийг авна
        // Оролтын утгуудыг шалгана
        if (!roomCode || typeof roomCode !== "string" || roomCode.trim() === "") {
            return res.status(400).json({ message: "Өрөөний кодыг оруулна уу." });
        }
        if (!playerName ||
            typeof playerName !== "string" ||
            playerName.trim() === "") {
            return res.status(400).json({ message: "Тоглогчийн нэрийг оруулна уу." });
        }
        // Өрөөг кодоор нь хайна
        const room = await prisma_1.default.room.findUnique({
            where: { code: roomCode.trim() },
            include: {
                player: true, // Өрөөний тоглогчдыг хамт татна
            },
        });
        // Хэрэв өрөө олдсон эсэхийг шалгана
        if (!room) {
            return res
                .status(404)
                .json({ message: "Өрөө олдсонгүй. Кодоо шалгана уу." });
        }
        // Ижил нэртэй тоглогч тухайн өрөөнд байгаа эсэхийг шалгана (нэр давхардлаас сэргийлнэ)
        const existingplayer = room.player.find((p) => p.name.toLowerCase() === playerName.trim().toLowerCase());
        // if (existingplayer) {
        //   // Хэрэв ижил нэртэй тоглогч байвал тэр тоглогчийг буцаана
        //   return res.status(200).json({
        //     message: "Та аль хэдийн энэ өрөөнд ижил нэрээр нэгдсэн байна.",
        //     room: {
        //       id: room.id,
        //       name: room.roomName,
        //       code: room.code,
        //     },
        //     player: {
        //       id: existingplayer.id,
        //       name: existingplayer.name,
        //     },
        //   });
        // }
        // Шинэ тоглогчийг өгөгдлийн санд үүсгэнэ
        const newPlayer = await prisma_1.default.player.create({
            data: {
                name: playerName.trim(),
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
            player: newPlayer,
        });
    }
    catch (err) {
        console.error("Өрөөнд нэгдэхэд алдаа гарлаа:", err);
        return res
            .status(500)
            .json({ message: "Серверийн дотоод алдаа гарлаа.", error: err.message });
    }
};
exports.createplayer = createplayer;
