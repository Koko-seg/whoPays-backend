// src/controllers/player.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const createplayer = async (req: Request, res: Response) => {
  try {
    const { roomCode, playerName } = req.body;

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

    const room = await prisma.room.findUnique({
      where: { code: roomCode.trim() },
      include: { player: true },
    });

    if (!room) {
      return res
        .status(404)
        .json({ message: "Өрөө олдсонгүй. Кодоо шалгана уу." });
    }

    const existingplayer = room.player.find(
      (p) => p.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (existingplayer) {
      return res.status(200).json({
        message: "Та аль хэдийн энэ өрөөнд ижил нэрээр нэгдсэн байна.",
        room: {
          id: room.id,
          name: room.roomName,
          code: room.code,
        },
        player: {
          id: existingplayer.id,
          name: existingplayer.name,
        },
      });
    }

    const newPlayer = await prisma.player.create({
      data: {
        name: playerName.trim(),
        roomId: room.id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Өрөөнд амжилттай нэгдлээ!",
      room: {
        id: room.id,
        name: room.roomName,
        code: room.code,
      },
      player: newPlayer,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Өрөөнд нэгдэхэд алдаа гарлаа:", err.message);
      return res.status(500).json({
        message: "Серверийн дотоод алдаа гарлаа.",
        error: err.message,
      });
    }

    console.error("Өрөөнд нэгдэхэд тодорхойгүй алдаа:", err);
    return res.status(500).json({
      message: "Серверийн тодорхойгүй алдаа гарлаа.",
      error: String(err),
    });
  }
};
