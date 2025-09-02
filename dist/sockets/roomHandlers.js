"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomHandlers = roomHandlers;
const prisma_1 = __importDefault(require("../utils/prisma"));
function roomHandlers(io, socket) {
    const getRoomData = async (roomCode) => {
        const roomWithPlayers = await prisma_1.default.room.findUnique({
            where: { code: roomCode },
            include: { player: true },
        });
        if (!roomWithPlayers)
            return null;
        return {
            roomCode: roomWithPlayers.code,
            host: roomWithPlayers.player.find(p => p.isHost)?.name || null,
            players: roomWithPlayers.player.map(p => p.name),
            selectedGame: roomWithPlayers.selectedGame ?? null,
            currentGame: roomWithPlayers.selectedGame ?? null,
            roomName: roomWithPlayers.roomName,
        };
    };
    // --- Join Room ---
    socket.on("joinRoom", async ({ roomCode, playerName }) => {
        if (!roomCode || !playerName) {
            socket.emit("joinError", { message: "Room code болон player name шаардлагатай." });
            return;
        }
        try {
            const room = await prisma_1.default.room.findUnique({ where: { code: roomCode } });
            if (!room) {
                socket.emit("joinError", { message: "Өрөө олдсонгүй. Кодоо шалгана уу." });
                return;
            }
            socket.join(roomCode);
            const existingPlayer = await prisma_1.default.player.findUnique({
                where: { name_roomId: { name: playerName, roomId: room.id } },
            });
            let isHost;
            if (existingPlayer) {
                isHost = existingPlayer.isHost;
            }
            else {
                const hostExists = await prisma_1.default.player.count({ where: { roomId: room.id, isHost: true } });
                isHost = hostExists === 0;
            }
            await prisma_1.default.player.upsert({
                where: { name_roomId: { name: playerName, roomId: room.id } },
                update: { socketId: socket.id },
                create: { name: playerName, socketId: socket.id, roomId: room.id, isHost },
            });
            const updatedRoomData = await getRoomData(roomCode);
            if (updatedRoomData)
                io.in(roomCode).emit("roomData", updatedRoomData);
        }
        catch (err) {
            console.error("joinRoom error:", err);
            socket.emit("joinError", { message: err.message || "Өрөөнд нэвтрэхэд алдаа гарлаа." });
        }
    });
    // --- Host select game ---
    socket.on("host:select_game", async ({ roomCode, gameType }) => {
        try {
            await prisma_1.default.room.update({ where: { code: roomCode }, data: { selectedGame: gameType } });
            const updatedRoomData = await getRoomData(roomCode);
            if (updatedRoomData)
                io.in(roomCode).emit("roomData", updatedRoomData);
        }
        catch (err) {
            console.error("host:select_game error:", err);
            socket.emit("roomError", { message: "Тоглоом сонгоход алдаа гарлаа." });
        }
    });
    // --- Disconnect ---
    socket.on("disconnecting", async () => {
        try {
            const player = await prisma_1.default.player.findFirst({ where: { socketId: socket.id }, include: { room: true } });
            if (!player)
                return;
            const { room, isHost, id: playerId, roomId } = player;
            const roomCode = room.code;
            await prisma_1.default.player.delete({ where: { id: playerId } });
            const remainingPlayers = await prisma_1.default.player.findMany({ where: { roomId } });
            if (isHost && remainingPlayers.length > 0) {
                await prisma_1.default.player.update({ where: { id: remainingPlayers[0].id }, data: { isHost: true } });
            }
            const updatedRoomData = await getRoomData(roomCode);
            if (updatedRoomData)
                io.in(roomCode).emit("roomData", updatedRoomData);
        }
        catch (err) {
            console.error("disconnecting error:", err);
        }
    });
    // --- SpinWheel update ---
    socket.on("spin", async ({ rotation, winner, roomCode }) => {
        try {
            io.in(roomCode).emit("spinUpdate", { rotation, winner });
        }
        catch (err) {
            console.error("spin error:", err);
            socket.emit("spinError", { message: "Spin хийхэд алдаа гарлаа." });
        }
    });
    // --- Runner Game: update positions ---
    socket.on("runner:update_positions", ({ roomCode, positions }) => {
        // Бүх тоглогчид байрлалыг илгээх
        io.in(roomCode).emit("runner:update_positions", positions);
        // Хожигчийг шалгах
        const winnerEntry = Object.entries(positions).find(([_, pos]) => pos >= 100);
        if (winnerEntry) {
            io.in(roomCode).emit("runner:finish", { winner: winnerEntry[0] });
        }
    });
    // --- Runner Game: finish ---
    socket.on("runner:finish", ({ roomCode, winner }) => {
        io.in(roomCode).emit("runner:finish", { winner });
    });
    // --- Runner Game: start ---
    socket.on("runner:start_game", ({ roomCode }) => {
        io.in(roomCode).emit("runner:start_game");
    });
    // --- Roast Game ---
    socket.on("roast:submit_reason", async ({ roomCode, reason }) => {
        if (!roomCode || !reason)
            return;
        // player info
        const player = await prisma_1.default.player.findFirst({ where: { socketId: socket.id } });
        if (!player)
            return;
        // 1️⃣ Submit хийсэн reason-ийг Reason table-д хадгалах
        await prisma_1.default.reason.create({
            data: {
                text: reason,
                playerId: player.id,
            },
        });
        // 2️⃣ Өрөөнд бүх тоглогчид reason харуулах
        io.in(roomCode).emit("roast:reason_submitted", { socketId: socket.id, reason });
        // 3️⃣ Таймер зөвхөн нэг удаа ажиллах
        if (!io.roastTimers)
            io.roastTimers = {};
        if (!io.roastTimers[roomCode]) {
            io.roastTimers[roomCode] = true;
            let counter = 30;
            const interval = setInterval(async () => {
                counter--;
                io.in(roomCode).emit("roast:timer_update", counter);
                if (counter <= 0) {
                    clearInterval(interval);
                    io.in(roomCode).emit("roast:timer_finished");
                    delete io.roastTimers[roomCode];
                    try {
                        // 4️⃣ Таймер дууссаны дараа Reason table-с бүх тоглогчийн шалтгаануудыг татах
                        const reasons = await prisma_1.default.reason.findMany({
                            where: { player: { roomId: player.roomId } },
                            select: { text: true, player: { select: { socketId: true, name: true } } },
                        });
                        const aiPlayers = reasons.map(r => ({
                            socketId: r.player.socketId,
                            reason: r.text,
                        }));
                        // 5️⃣ AI roast хийх controller руу дамжуулах
                        const fetchRes = await fetch("http://localhost:4200/roast", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: roomCode, players: aiPlayers }),
                        });
                        const data = await fetchRes.json();
                        // 6️⃣ Result-ийг бүх тоглогчид явуулах
                        if (data.success && data.roast) {
                            io.in(roomCode).emit("roast:result", {
                                roast: data.roast,
                                chosen: data.roastedReason,
                            });
                        }
                        else {
                            io.in(roomCode).emit("roast:error", { message: data.message || "Roast үүсгэхэд алдаа гарлаа" });
                        }
                    }
                    catch (err) {
                        console.error("Roast fetch error:", err);
                        io.in(roomCode).emit("roast:error", { message: "Roast үүсгэхэд алдаа гарлаа" });
                    }
                }
            }, 1000);
        }
    });
}
