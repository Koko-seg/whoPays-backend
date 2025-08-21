import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const deleteRoomByCode = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;

    if (!roomCode || !/^\d{5}$/.test(roomCode)) {
      return res.status(400).json({ message: "Зөв 5 оронтой код оруулна уу" });
    }

    const room = await prisma.room.findUnique({ where: { code: roomCode } });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // First delete participants, results, messages if cascade not configured
    await prisma.participant.deleteMany({ where: { roomId: room.id } });
    await prisma.result.deleteMany({ where: { roomId: room.id } });
    await prisma.message.deleteMany({ where: { roomId: room.id } });

    await prisma.room.delete({ where: { id: room.id } });

    return res.status(200).json({ message: "Room deleted" });
  } catch (err: any) {
    console.error("deleteRoomByCode алдаа:", err);
    return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
};
