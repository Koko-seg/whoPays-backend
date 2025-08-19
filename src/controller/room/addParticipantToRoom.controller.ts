import { Request, Response } from "express";
import prisma from "../../utils/prisma";

const MAX_PARTICIPANTS = 10;

export const addParticipantToRoom = async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.params;
    const { nickname } = req.body;

    if (!roomCode || roomCode.length !== 5) {
      return res.status(400).json({ message: "Зөв өрөөний код оруулна уу (5 орон)" });
    }

    if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
      return res.status(400).json({ message: "Nickname оруулна уу." });
    }

    // Өрөө байгаа эсэх, тоглоом эхэлсэн эсэхийг шалгана
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
      include: {
        participants: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room does not exist" });
    }

    if (room.gamestatus !== "PENDING") {
      return res.status(400).json({ message: "Cannot join room: game already started" });
    }

    if (room.participants.length >= MAX_PARTICIPANTS) {
      return res.status(400).json({ message: "Room is full" });
    }

    // Nickname давтагдсан эсэхийг шалгана
    const existingParticipant = room.participants.find(
      (p) => p.name.toLowerCase() === nickname.trim().toLowerCase()
    );

    if (existingParticipant) {
      return res.status(409).json({ message: "Nickname already taken" });
    }

    // Шинэ participant үүсгэнэ
    const newParticipant = await prisma.participant.create({
      data: {
        name: nickname.trim(),
        roomId: room.id,
        isHost: false,
      },
    });

    return res.status(201).json({
      participantId: newParticipant.id,
      message: "Participant added successfully",
    });
  } catch (err: any) {
    console.error("Participant нэмэхэд алдаа гарлаа:", err);
    return res
      .status(500)
      .json({ message: "Серверийн алдаа гарлаа", error: err.message });
  }
};
