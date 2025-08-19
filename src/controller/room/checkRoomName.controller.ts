import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const checkRoomName = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body байхгүй байна." });
    }

    const { roomName } = req.body;

    if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
      return res.status(400).json({ message: "Өрөөний нэрийг оруулна уу." });
    }

    // Өрөөний нэр давтагдсан эсэхийг шалгана
    const existingRoom = await prisma.room.findUnique({
      where: { roomName: roomName.trim() },
    });

    if (existingRoom) {
      return res.status(409).json({ message: "Room name already exists" });
    }

    return res.status(200).json({ message: "Room name is available" });
  } catch (err: any) {
    console.error("Өрөөний нэр шалгахад алдаа гарлаа:", err);
    return res
      .status(500)
      .json({ message: "Серверийн алдаа гарлаа", error: err.message });
  }
};
