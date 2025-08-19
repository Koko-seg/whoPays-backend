import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getRoomMessages = async (req: Request, res: Response) => {
  try {
    const roomId = Number(req.params.roomId);
    if (!roomId) return res.status(400).json({ message: "roomId буруу" });

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, messages });
  } catch (e: any) {
    console.error("getRoomMessages error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
