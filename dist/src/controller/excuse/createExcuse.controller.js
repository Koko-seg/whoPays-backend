"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerRoomRoast = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
dotenv_1.default.config();
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in .env");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const triggerRoomRoast = async (req, res) => {
    try {
        // frontend-аас ирсэн body
        // players = [{ socketId: string, reason: string }]
        const { code, players, } = req.body;
        if (!code)
            return res.status(400).json({ message: "roomId шаардлагатай байна." });
        if (!players || players.length === 0)
            return res.status(400).json({ message: "Players массив шаардлагатай." });
        // Өрөө хайх
        const room = await prisma_1.default.room.findUnique({ where: { code } });
        if (!room)
            return res.status(404).json({ message: "Өрөө олдсонгүй." });
        // Бүх players-ийн reason-уудыг message болгон хадгалах
        const messages = [];
        for (const p of players) {
            const msg = await prisma_1.default.message.create({
                data: {
                    roomId: room.id,
                    socketId: p.socketId,
                    summary: p.reason,
                },
            });
            messages.push(msg);
        }
        // 🔹 AI-д өгөх prompt бэлдэх
        const allReasonsText = players
            .map((p, i) => `${i + 1}. ${p.reason}`)
            .join("\n");
        const prompt = `
Чи бол Монгол хэл дээр хөгжилтэй roast хийдэг AI.
Доорх өгөгдсөн шалтгаануудын дундаас нэгийг нь сонгож, зөвхөн 1 шалтгааныг сонго. Хэрэв өрөөнд байгаа хүмүүс адилхан шалтаг бичсэн байвал хоёуланг нь сонгож болно.
Тэр сонгогдсон шалтгаан дээрээ ёжилж, 50 тэмдэгтэд багтаасан roast бич. 
Emoji ашиглаж болно. Мөн тэр сонгогдсон шалтгааныг өнөөдөр тооцооноос чөлөөтэй гэж хэлж болно.
Шалтгаанууд:
${allReasonsText}
`;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const roast = result.response.text().trim();
        // 🔹 AI сонгосон шалтгаан-ыг гаргаж авах
        let chosenReason = allReasonsText.split("\n")[0]; // default
        for (const r of players.map((p) => p.reason)) {
            if (roast.includes(r)) {
                chosenReason = r;
                break;
            }
        }
        // Roast-ийг message болгон хадгалах
        const roastMessage = await prisma_1.default.message.create({
            data: {
                roomId: room.id,
                summary: roast,
            },
        });
        return res.status(201).json({
            success: true,
            roast,
            roastedReason: chosenReason,
            messageIds: [...messages.map((m) => m.id), roastMessage.id],
        });
    }
    catch (e) {
        if (e instanceof Error) {
            console.error("triggerRoomRoast алдаа:", e.message);
            return res.status(500).json({
                success: false,
                message: "Сервер талд алдаа гарлаа.",
                error: e.message,
            });
        }
        console.error("triggerRoomRoast тодорхойгүй алдаа:", e);
        return res.status(500).json({
            success: false,
            message: "Сервер талд тодорхойгүй алдаа гарлаа.",
            error: String(e),
        });
    }
};
exports.triggerRoomRoast = triggerRoomRoast;
