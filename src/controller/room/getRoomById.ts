// src/controllers/room.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";

// Room-ийг ID-аар авах
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.id); // URL parameter-аас авна
    if (isNaN(roomId)) {
      return res.status(400).json({ message: "Room ID буруу байна." });
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        participants: true,
        results: true,
        message: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room олдсонгүй." });
    }

    return res.status(200).json({ room });
  } catch (err: any) {
    console.error("Room авахад алдаа гарлаа:", err);
    return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
};
