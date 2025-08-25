// src/controllers/player.controller.ts or add to room.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";
 
export const createplayer = async (req: Request, res: Response) => {
  try {
    const { roomCode, playerName } = req.body; // Хүсэлтээс өрөөний код болон тоглогчийн нэрийг авна
 
    // Оролтын утгуудыг шалгана
    if (!roomCode || typeof roomCode !== "string" || roomCode.trim() === "") {
      return res.status(400).json({ message: "Өрөөний кодыг оруулна уу." });
    }
    if (
      !playerName ||
      typeof playerName !== "string" ||
      playerName.trim() === ""
    ) {
      return res.status(400).json({ message: "Тоглогчийн нэрийг оруулна уу." });
    }
 
    // Өрөөг кодоор нь хайна
    const room = await prisma.room.findUnique({
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
    const existingplayer = room.player.find(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );
 
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
    const newPlayer = await prisma.player.create({
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
  } catch (err: any) {
    console.error("Өрөөнд нэгдэхэд алдаа гарлаа:", err);
    return res
      .status(500)
      .json({ message: "Серверийн дотоод алдаа гарлаа.", error: err.message });
  }
};
 
 