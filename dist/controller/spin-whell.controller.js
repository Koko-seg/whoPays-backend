"use strict";
// src/controllers/spin.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinWheel = void 0;
const spinWheel = async (req, res) => {
    try {
        const { participants } = req.body;
        // Check if participants is a valid, non-empty array
        if (!participants ||
            !Array.isArray(participants) ||
            participants.length === 0) {
            return res.status(400).json({ message: "Та нэрээ оруулна уу." });
        }
        // Randomly select one person from the array
        const randomIndex = Math.floor(Math.random() * participants.length);
        const loser = participants[randomIndex];
        // Send the loser's name back to the client
        return res.json({ loser });
    }
    catch (err) {
        console.error("Spin wheel error:", err);
        return res
            .status(500)
            .json({ message: "Тоглоомын үед алдаа гарлаа", error: err.message });
    }
};
exports.spinWheel = spinWheel;
