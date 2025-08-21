// import { Request, Response } from "express";

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";
// import prisma from "../../utils/prisma";
// dotenv.config();

// if (!process.env.GEMINI_API_KEY) {
//   throw new Error("GEMINI_API_KEY not found in .env");
// }

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// /**
//  * POST /api/reasons
//  * body: { participantId: number, reasons: string[] }
//  * — Тухайн оролцогч зөвхөн өөрийн reasons-ээ илгээнэ
//  * — Server тал AI roast үүсгээд Room-д Message болгон хадгална
//  */
// export const createReasonsWithRoast = async (req: Request, res: Response) => {
//   try {
//     const { participantId, reasons } = req.body;

//     if (!participantId || !Array.isArray(reasons) || reasons.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "participantId болон reasons[] шаардлагатай" });
//     }

//     // Participant + Room шалгах
//     const participant = await prisma.participant.findUnique({
//       where: { id: Number(participantId) },
//       include: { room: true },
//     });
//     if (!participant)
//       return res.status(404).json({ message: "Participant олдсонгүй" });

//     // 1) Reasons хадгалах
//     await prisma.reason.createMany({
//       data: reasons.map((text: string) => ({
//         text,
//         participantId: participant.id,
//       })),
//     });

//     const prompt = `
// Чи бол Монгол хэл дээр хөгжилтэй roast хийдэг AI.
// Чамд хэд хэдэн "шалтгаан" өгөгдөнө.
// Тэр шалтгаануудаас санамсаргүй байдлаар нэгийг сонгоод,
// ёжтой, богино, 50 тэмдэгтэд багтаан бич. Emoji ашиглаж болно.

// Оролтын шалтгаанууд:
// ${reasons.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}
// `;

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const roast = result.response.text().trim();

//     // 3) Roast мессежийг Room-д хадгалах
//     const message = await prisma.message.create({
//       data: {
//         summary: roast,
//         roomId: participant.roomId,
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       roast,
//       messageId: message.id,
//     });
//   } catch (e: any) {
//     console.error("createReasonsWithRoast error:", e);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error: e.message });
//   }
// };

import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import prisma from "../utils/prisma";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not found in .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/reasons
 * body: { reasons: string[] }
 * — Зөвхөн өөрийн reasons-ийг илгээдэг
 * — Server AI roast үүсгээд Room-д Message болгон хадгална
 */
export const createReasonsWithRoast = async (req: Request, res: Response) => {
  try {
    const { reasons } = req.body;

    // Шалгалт
    if (!Array.isArray(reasons) || reasons.length === 0) {
      return res.status(400).json({ message: "reasons[] шаардлагатай" });
    }

    // 1) AI prompt үүсгэх
    const prompt = `
Чи бол Монгол хэл дээр хөгжилтэй roast хийдэг AI.
Чамд хэд хэдэн "шалтгаан" өгөгдөнө.
Тэр шалтгаануудаас санамсаргүй байдлаар нэгийг сонгоод,
ёжтэй, богино, 50 тэмдэгтэд багтаан бич. Emoji ашиглаж болно.

Оролтын шалтгаанууд:
${reasons.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const roast = result.response.text().trim();

    // 2) Room ID-г хаанаас авах вэ гэдэгийг шийдэх шаардлагатай
    // Жишээ: нэг тогтмол roomId = 1 ашиглаж байна
    const ROOM_ID = 1;

    // 3) Roast мессежийг Room-д хадгалах
    const message = await prisma.message.create({
      data: {
        summary: roast,
        roomId: ROOM_ID,
      },
    });

    // 4) Frontend-д буцаах
    return res.status(201).json({
      success: true,
      roast,
      messageId: message.id,
    });
  } catch (e: any) {
    console.error("createReasonsWithRoast error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: e.message });
  }
};
