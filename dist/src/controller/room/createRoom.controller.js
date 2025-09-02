"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoom = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
// 5 оронтой тоон код үүсгэх функц
async function generateUniqueRoomCode() {
    let code = "";
    let isUnique = false;
    while (!isUnique) {
        code = Math.floor(10000 + Math.random() * 90000).toString();
        const existingRoom = await prisma_1.default.room.findUnique({
            where: { code },
        });
        if (!existingRoom) {
            isUnique = true;
        }
    }
    return code;
}
const createRoom = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body байхгүй байна." });
        }
        const { roomName, hostNickname } = req.body;
        if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
            return res.status(400).json({ message: "Өрөөний нэрийг оруулна уу." });
        }
        if (!hostNickname ||
            typeof hostNickname !== "string" ||
            hostNickname.trim() === "") {
            return res.status(400).json({ message: "Host nickname оруулна уу." });
        }
        const uniqueCode = await generateUniqueRoomCode();
        const newRoom = await prisma_1.default.room.create({
            data: {
                roomName: roomName.trim(),
                code: uniqueCode,
                gameType: "SPIN_WHELL",
                gamestatus: "PENDING",
            },
        });
        const hostPlayer = await prisma_1.default.player.create({
            data: {
                name: hostNickname.trim(),
                roomId: newRoom.id,
                isHost: true,
            },
        });
        return res.status(201).json({
            roomName: newRoom.roomName,
            roomCode: newRoom.code,
            roomId: newRoom.id,
            hostPlayerId: hostPlayer.id,
        });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Өрөө үүсгэхэд алдаа гарлаа:", err.message);
            return res
                .status(500)
                .json({ message: "Серверийн алдаа гарлаа", error: err.message });
        }
        console.error("Өрөө үүсгэхэд тодорхойгүй алдаа:", err);
        return res.status(500).json({
            message: "Серверийн тодорхойгүй алдаа гарлаа",
            error: String(err),
        });
    }
};
exports.createRoom = createRoom;
