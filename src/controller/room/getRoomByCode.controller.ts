// src/controllers/room.controller.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma";

// 5 оронтой кодоор өрөөг авах
export const getRoomByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Бутархай, хоосон, урт шалгах
    if (!code || typeof code !== "string" || !/^\d{5}$/.test(code)) {
      return res
        .status(400)
        .json({ message: "Хүссэн 5 оронтой кодыг оруулна уу." });
    }

    // Өрөө болон бүх player-ын мэдээллийг авна
    const room = await prisma.room.findUnique({
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
        selectedGame: room.selectedGame,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("getRoomByCode алдаа:", message);
    return res.status(500).json({ message: "Серверийн алдаа", error: message });
  }
};
