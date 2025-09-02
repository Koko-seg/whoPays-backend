// src/controllers/player.controller.ts
import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const removeplayerFromRoom = async (req: Request, res: Response) => {
  try {
    const { roomCode, playerId } = req.params;

    if (!roomCode || roomCode.length !== 5) {
      return res
        .status(400)
        .json({ message: "Зөв өрөөний код оруулна уу (5 орон)" });
    }

    if (!playerId || isNaN(Number(playerId))) {
      return res.status(400).json({ message: "Зөв player ID оруулна уу" });
    }

    // Өрөө байгаа эсэхийг шалгана
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: { player: true },
    });

    if (!room) {
      return res.status(404).json({ message: "Room does not exist" });
    }

    // Тоглоом эхэлсэн бол player устгаж болохгүй
    if (room.gamestatus !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Cannot remove player: game already started" });
    }

    // player байгаа эсэхийг шалгана
    const player = await prisma.player.findFirst({
      where: { id: Number(playerId), roomId: room.id },
    });

    if (!player) {
      return res.status(404).json({ message: "player not found in this room" });
    }

    // Host бол устгаж болохгүй
    if (player.isHost) {
      return res.status(400).json({ message: "Cannot remove host player" });
    }

    // player-г устгана
    await prisma.player.delete({ where: { id: Number(playerId) } });

    return res.status(200).json({
      message: "player removed successfully",
      playerId: Number(playerId),
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("player устгахад алдаа гарлаа:", err.message);
      return res
        .status(500)
        .json({ message: "Серверийн алдаа гарлаа", error: err.message });
    }

    console.error("player устгахад тодорхойгүй алдаа:", err);
    return res.status(500).json({
      message: "Серверийн тодорхойгүй алдаа гарлаа",
      error: String(err),
    });
  }
};
