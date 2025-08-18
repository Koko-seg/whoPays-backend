import express, { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from "dotenv";
dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not found in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const roastReason = async (req: Request, res: Response) => {
  try {
    const { reasons } = req.body;

    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
      return res.status(400).json({ message: "Reasons массив оруулна уу" });
    }

    const prompt = `
Чи бол Монгол хэл дээр хөгжилтэй roast хийдэг AI. 
Чамд хэд хэдэн "шалтгаан" өгөгдөнө. 
Тэр шалтгаануудаас санамсаргүй байдлаар сонгоод, 
 өнөөдрийн тооцоог гаргах хүн болгож зарла.  

Дүрэм:
- Зөвхөн нэг шалтгаан сонго.
- Сонгосон шалтгаанаа үндэслээд тухайн хүнийг хөгжилтэй, ёжтой байдлаар roast хий. 
- Богинохон боловч хөгжилтэй байдлаар бич.
- Монгол хэлээр зөв найруулгатайгаар  50 үсгэнд багтааж бич.
- emoji ашиглаж болно.


Оролтын шалтгаанууд:
${reasons.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const roast = result.response.text();

    return res.json({ roast });
  } catch (err: any) {
    console.error("Roast error:", err);
    return res
      .status(500)
      .json({ message: "AI алдаа гарлаа", error: err.message });
  }
};
