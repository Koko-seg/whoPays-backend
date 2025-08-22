"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoomName = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const checkRoomName = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body байхгүй байна." });
        }
        const { roomName } = req.body;
        if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
            return res.status(400).json({ message: "Өрөөний нэрийг оруулна уу." });
        }
        // Өрөөний нэр давтагдсан эсэхийг шалгана
        const existingRoom = await prisma_1.default.room.findUnique({
            where: { roomName: roomName.trim() },
        });
        if (existingRoom) {
            return res.status(409).json({ message: "Room name already exists" });
        }
        return res.status(200).json({ message: "Room name is available" });
    }
    catch (err) {
        console.error("Өрөөний нэр шалгахад алдаа гарлаа:", err);
        return res
            .status(500)
            .json({ message: "Серверийн алдаа гарлаа", error: err.message });
    }
};
exports.checkRoomName = checkRoomName;
