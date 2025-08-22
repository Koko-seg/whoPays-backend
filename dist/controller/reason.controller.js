"use strict";
// import { Request, Response } from "express";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReasonsWithRoast = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("../utils/prisma"));
dotenv_1.default.config();
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in .env");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
/**
 * POST /api/reasons
 * body: { reasons: string[] }
 * — Зөвхөн өөрийн reasons-ийг илгээдэг
 * — Server AI roast үүсгээд Room-д Message болгон хадгална
 */
const createReasonsWithRoast = async (req, res) => {
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
${reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const roast = result.response.text().trim();
        // 2) Room ID-г хаанаас авах вэ гэдэгийг шийдэх шаардлагатай
        // Жишээ: нэг тогтмол roomId = 1 ашиглаж байна
        const ROOM_ID = 1;
        // 3) Roast мессежийг Room-д хадгалах
        const message = await prisma_1.default.message.create({
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
    }
    catch (e) {
        console.error("createReasonsWithRoast error:", e);
        return res
            .status(500)
            .json({ success: false, message: "Server error", error: e.message });
    }
};
exports.createReasonsWithRoast = createReasonsWithRoast;
