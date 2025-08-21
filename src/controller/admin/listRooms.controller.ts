import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const listRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      include: { participants: true, results: true, message: true },
    });
    return res.status(200).json({ rooms });
  } catch (err: any) {
    console.error("listRooms алдаа:", err);
    return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
};
