"use strict";
// src/controllers/spin.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinWheel = void 0;
const spinWheel = async (req, res) => {
    try {
        const { player } = req.body;
        // Check if player is a valid, non-empty array
        if (!player ||
            !Array.isArray(player) ||
            player.length === 0) {
            return res.status(400).json({ message: "Та нэрээ оруулна уу." });
        }
        // Randomly select one person from the array
        const randomIndex = Math.floor(Math.random() * player.length);
        const loser = player[randomIndex];
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
