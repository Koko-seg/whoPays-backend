"use strict";
// src/controllers/room.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomByCode = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// 5 оронтой кодоор өрөөг авах
const getRoomByCode = async (req, res) => {
    try {
        const { code } = req.params;
        // Бутархай, хоосон, урт шалгах
        if (!code || typeof code !== "string" || !/^\d{5}$/.test(code)) {
            return res.status(400).json({ message: "Хүссэн 5 оронтой кодыг оруулна уу." });
        }
        // Өрөө болон бүх player-ын мэдээллийг авна
        const room = await prisma_1.default.room.findUnique({
            where: { code: code },
            include: {
                player: {
                    select: {
                        id: true,
                        name: true,
                        roomId: true,
                        isHost: true,
                        createdAt: true,
                        results: true,
                        reasons: true,
                    },
                },
                results: true,
                message: true,
            },
        });
        if (!room) {
            return res.status(404).json({ message: "Room does not exist" });
        }
        return res.status(200).json({
            room: {
                id: room.id,
                code: room.code,
                roomName: room.roomName,
                createdAt: room.createdAt,
                gameType: room.gameType,
                gamestatus: room.gamestatus,
                player: room.player,
                results: room.results,
                message: room.message,
                slectedGame: room.selectedGame
            }
        });
    }
    catch (err) {
        console.error("getRoomByCode алдаа:", err);
        return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
    }
};
exports.getRoomByCode = getRoomByCode;
