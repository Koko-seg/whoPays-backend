// src/controllers/room.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";
// Prisma Client-аа импортлоно

// 5 оронтой тоон код үүсгэх функц
async function generateUniqueRoomCode(): Promise<string> {
  let code: string = ""; // Энд 'code' хувьсагчийг хоосон мөрөөр эхлүүлсэн
  let isUnique = false;

  while (!isUnique) {
    // 10000-аас 99999 хооронд random 5 оронтой тоо үүсгэнэ
    code = Math.floor(10000 + Math.random() * 90000).toString();

    // Энэ кодтой өрөө байгаа эсэхийг шалгана
    const existingRoom = await prisma.room.findUnique({
      where: { code: code },
    });

    if (!existingRoom) {
      isUnique = true;
    }
  }
  return code;
}

export const createRoom = async (req: Request, res: Response) => {
  try {
    // req.body-г шалгаж, undefined бол алдаа буцаана
    if (!req.body) {
      return res.status(400).json({ message: "Request body байхгүй байна." });
    }

    const { roomName, hostNickname } = req.body; // Host nickname нэмэгдлээ

    if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
      return res.status(400).json({ message: "Өрөөний нэрийг оруулна уу." });
    }

    if (!hostNickname || typeof hostNickname !== "string" || hostNickname.trim() === "") {
      return res.status(400).json({ message: "Host nickname оруулна уу." });
    }

    // Өрөөний нэр давтагдсан эсэхийг шалгана
    const existingRoomByName = await prisma.room.findUnique({
      where: { roomName: roomName.trim() },
    });

    if (existingRoomByName) {
      return res.status(409).json({ message: "Room name already exists" });
    }

    // Өвөрмөц 5 оронтой кодыг үүсгэнэ
    const uniqueCode = await generateUniqueRoomCode();

    // Шинэ өрөөг өгөгдлийн санд үүсгэнэ
    const newRoom = await prisma.room.create({
      data: {
        roomName: roomName.trim(),
        code: uniqueCode,
        gameType: "SPIN_WHELL", // Энэ тоглоомонд SPIN_WHELL-ийг default болгож болно.
        gamestatus: "PENDING",
      },
    });

    // Host participant үүсгэнэ
    const hostParticipant = await prisma.participant.create({
      data: {
        name: hostNickname.trim(),
        roomId: newRoom.id,
        isHost: true,
      },
    });

    // Өрөөний мэдээллийг буцаана
    return res.status(201).json({
      roomName: newRoom.roomName,
      roomCode: newRoom.code,
      roomId: newRoom.id,
      hostParticipantId: hostParticipant.id,
    });
  } catch (err: any) {
    console.error("Өрөө үүсгэхэд алдаа гарлаа:", err);
    return res
      .status(500)
      .json({ message: "Серверийн алдаа гарлаа", error: err.message });
  }
};
