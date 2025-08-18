// src/controllers/room.controller.ts
import { Request, Response } from "express";
import prisma from "../utils/prisma";
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
    const { roomName } = req.body; // Хэрэглэгчээс өрөөний нэрийг хүлээн авна

    if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
      return res.status(400).json({ message: "Өрөөний нэрийг оруулна уу." });
    }

    // Өвөрмөц 5 оронтой кодыг үүсгэнэ
    const uniqueCode = await generateUniqueRoomCode();

    // Шинэ өрөөг өгөгдлийн санд үүсгэнэ
    const newRoom = await prisma.room.create({
      data: {
        roomName: roomName,
        code: uniqueCode,
        // Бусад шаардлагатай талбаруудыг Prisma schema-аас хамаарч оруулна.
        // Жишээ нь: gameType, status зэрэгт default утга өгсөн тул энд заавал оруулахгүй байж болно.
        // Хэрэв өөр default утга өгөхгүй бол энд тодорхой зааж өгнө.
        gameType: "SPIN_WHELL", // Энэ тоглоомонд SPIN_WHELL-ийг default болгож болно.
        gamestatus: "PENDING",
      },
      select: {
        // Зөвхөн хэрэгтэй талбаруудыг буцаана
        id: true,
        roomName: true,
        code: true,
        createdAt: true,
      },
    });

    // Өрөөний кодыг буцаана
    return res.status(201).json({
      message: "Өрөө амжилттай үүслээ!",
      roomCode: newRoom.code,
      roomId: newRoom.id,
      roomName: newRoom.roomName,
    });
  } catch (err: any) {
    console.error("Өрөө үүсгэхэд алдаа гарлаа:", err);
    return res
      .status(500)
      .json({ message: "Серверийн алдаа гарлаа", error: err.message });
  }
};
