import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";

export function roomHandlers(io: Server, socket: Socket) {
  const getRoomData = async (roomCode: string) => {
    const roomWithPlayers = await prisma.room.findUnique({
      where: { code: roomCode },
      include: { player: true },
    });

    if (!roomWithPlayers) return null;

    return {
      roomCode: roomWithPlayers.code,
      host: roomWithPlayers.player.find(p => p.isHost)?.name || null,
      players: roomWithPlayers.player.map(p => p.name),
      selectedGame: roomWithPlayers.selectedGame ?? null,
      currentGame: roomWithPlayers.selectedGame ?? null,
    };
  };

  // --- Join Room ---
  socket.on("joinRoom", async ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) {
      socket.emit("joinError", { message: "Room code болон player name шаардлагатай." });
      return;
    }

    try {
      const room = await prisma.room.findUnique({ where: { code: roomCode } });
      if (!room) {
        socket.emit("joinError", { message: "Өрөө олдсонгүй. Кодоо шалгана уу." });
        return;
      }

      socket.join(roomCode);

      const existingPlayer = await prisma.player.findUnique({
        where: { name_roomId: { name: playerName, roomId: room.id } },
      });

      let isHost: boolean;
      if (existingPlayer) {
        isHost = existingPlayer.isHost;
      } else {
        const hostExists = await prisma.player.count({ where: { roomId: room.id, isHost: true } });
        isHost = hostExists === 0;
      }

      await prisma.player.upsert({
        where: { name_roomId: { name: playerName, roomId: room.id } },
        update: { socketId: socket.id },
        create: { name: playerName, socketId: socket.id, roomId: room.id, isHost },
      });

      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) io.in(roomCode).emit("roomData", updatedRoomData);
    } catch (err: any) {
      console.error("joinRoom error:", err);
      socket.emit("joinError", { message: err.message || "Өрөөнд нэвтрэхэд алдаа гарлаа." });
    }
  });

  // --- Host select game ---
  socket.on("host:select_game", async ({ roomCode, gameType }) => {
    try {
      await prisma.room.update({ where: { code: roomCode }, data: { selectedGame: gameType } });
      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) io.in(roomCode).emit("roomData", updatedRoomData);
    } catch (err) {
      console.error("host:select_game error:", err);
      socket.emit("roomError", { message: "Тоглоом сонгоход алдаа гарлаа." });
    }
  });

  // --- Disconnect ---
  socket.on("disconnecting", async () => {
    try {
      const player = await prisma.player.findFirst({ where: { socketId: socket.id }, include: { room: true } });
      if (!player) return;

      const { room, isHost, id: playerId, roomId } = player;
      const roomCode = room.code;

      await prisma.player.delete({ where: { id: playerId } });

      const remainingPlayers = await prisma.player.findMany({ where: { roomId } });
      if (isHost && remainingPlayers.length > 0) {
        await prisma.player.update({ where: { id: remainingPlayers[0].id }, data: { isHost: true } });
      }

      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) io.in(roomCode).emit("roomData", updatedRoomData);
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });

  // --- SpinWheel update ---
  socket.on("spin", async ({ rotation, winner, roomCode }) => {
    try {
      io.in(roomCode).emit("spinUpdate", { rotation, winner });
    } catch (err) {
      console.error("spin error:", err);
      socket.emit("spinError", { message: "Spin хийхэд алдаа гарлаа." });
    }
  });

  // --- Runner Game: update positions ---
  socket.on("runner:update_positions", ({ roomCode, positions }: { roomCode: string; positions: Record<string, number> }) => {
    // Бүх тоглогчид байрлалыг илгээх
    io.in(roomCode).emit("runner:update_positions", positions);

    // Хожигчийг шалгах
    const winnerEntry = Object.entries(positions).find(([_, pos]) => pos >= 100);
    if (winnerEntry) {
      io.in(roomCode).emit("runner:finish", { winner: winnerEntry[0] });
    }
  });

  // --- Runner Game: finish ---
  socket.on("runner:finish", ({ roomCode, winner }: { roomCode: string; winner: string }) => {
    io.in(roomCode).emit("runner:finish", { winner });
  });

  // --- Runner Game: start ---
  socket.on("runner:start_game", ({ roomCode }: { roomCode: string }) => {
    io.in(roomCode).emit("runner:start_game");
  });
}
