// src/controller/excuse/triggerRoast.controller.ts
import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import prisma from "../../utils/prisma";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not found in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const triggerRoomRoast = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "roomId шаардлагатай байна." });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        participants: {
          include: { reasons: true },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Өрөө олдсонгүй." });
    }

    //* Бүх participants reason бичсэн эсэхийг шалгах
    const participantsWithoutReason = room.participants.filter(
      (p) => p.reasons.length === 0
    );

    if (participantsWithoutReason.length > 0) {
      return res.status(400).json({
        message: `Дараах оролцогчид шалтгаан илгээсэнгүй: ${participantsWithoutReason
          .map((p) => p.name)
          .join(", ")}`,
      });
    }

    //* Бүх шалтгаануудыг цуглуулах
    const allReasons = room.participants.flatMap((p) =>
      p.reasons.map((r) => r.text)
    );

    const randomIndex = Math.floor(Math.random() * allReasons.length);
    const chosenReason = allReasons[randomIndex];

    const prompt = `
Чи бол Монгол хэл дээр хөгжилтэй roast хийдэг AI.
Доорх өгөгдсөн шалтгаануудаас хамгийн хөгжилтэйг нь сонгож тэрхүү сонгосон шалтгаанаа ёжилж, 50 тэмдэгтэд багтаасан roast бич.
Emoji ашиглаж болно. Мөн тэр хүнийг өнөөдрийн тооцооноос чөлөөлсөн гэж үзэж болно.
Шалтгаан:
"${chosenReason}"
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const roast = result.response.text().trim();

    const message = await prisma.message.create({
      data: {
        summary: roast,
        roomId: room.id,
      },
    });

    return res.status(201).json({
      success: true,
      roast,
      roastedReason: chosenReason,
      roastedIndex: randomIndex,
      messageId: message.id,
    });
  } catch (e: any) {
    console.error("triggerRoomRoast алдаа:", e);
    return res.status(500).json({
      success: false,
      message: "Сервер талд алдаа гарлаа.",
      error: e.message,
    });
  }
};
