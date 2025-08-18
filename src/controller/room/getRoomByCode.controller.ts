// src/controllers/room.controller.ts

import { Request, Response } from "express";
import prisma from "../../utils/prisma";

// 5 оронтой кодоор өрөөг авах
export const getRoomByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    // Бутархай, хоосон, урт шалгах
    if (!code || typeof code !== "string" || !/^\d{5}$/.test(code)) {
      return res.status(400).json({ message: "Хүсьсэн 5 оронтой кодыг оруулна уу." });
    }

    // Хэрвээ schema-д code нь string байвал дараах байдлаар хайна
    const room = await prisma.room.findUnique({
      where: { code: code }, 
      select: {
        id: true,
        roomName: true,
        code: true,
        gameType: true,
        gamestatus: true,
        createdAt: true,
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Өгөгдсөн кодтой өрөө олдсонгүй." });
    }

    return res.status(200).json({ room });
  } catch (err: any) {
    console.error("getRoomByCode алдаа:", err);
    return res.status(500).json({ message: "Серверийн алдаа", error: err.message });
  }
};