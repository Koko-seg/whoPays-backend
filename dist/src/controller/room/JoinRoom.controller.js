"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addplayerToRoom = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const MAX_player = 10;
const addplayerToRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { nickname } = req.body;
        if (!roomCode || roomCode.length !== 5) {
            return res
                .status(400)
                .json({ message: "Зөв өрөөний код оруулна уу (5 орон)" });
        }
        if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
            return res.status(400).json({ message: "Nickname оруулна уу." });
        }
        const room = await prisma_1.default.room.findUnique({
            where: { code: roomCode },
            include: { player: true },
        });
        if (!room) {
            return res.status(404).json({ message: "Room does not exist" });
        }
        if (room.gamestatus !== "PENDING") {
            return res
                .status(400)
                .json({ message: "Cannot join room: game already started" });
        }
        if (room.player.length >= MAX_player) {
            return res.status(400).json({ message: "Room is full" });
        }
        const existingplayer = room.player.find((p) => p.name.toLowerCase() === nickname.trim().toLowerCase());
        if (existingplayer) {
            return res.status(409).json({ message: "Nickname already taken" });
        }
        const newPlayer = await prisma_1.default.player.create({
            data: {
                name: nickname.trim(),
                roomId: room.id,
                isHost: false,
            },
        });
        return res.status(201).json({
            playerId: newPlayer.id,
            message: "player added successfully",
        });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("player нэмэхэд алдаа гарлаа:", err.message);
            return res
                .status(500)
                .json({ message: "Серверийн алдаа гарлаа", error: err.message });
        }
        console.error("player нэмэхэд тодорхойгүй алдаа:", err);
        return res.status(500).json({
            message: "Серверийн тодорхойгүй алдаа гарлаа",
            error: String(err),
        });
    }
};
exports.addplayerToRoom = addplayerToRoom;
