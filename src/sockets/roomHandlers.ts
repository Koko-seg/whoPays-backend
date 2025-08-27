import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";

export function roomHandlers(io: Server, socket: Socket) {
  // 🟢 Өрөөний мэдээлэл авах туслах функц
  const getRoomData = async (roomCode: string) => {
    const roomWithPlayers = await prisma.room.findUnique({
      where: { code: roomCode },
      include: { player: true },
    });

    if (!roomWithPlayers) return null;

    return {
      roomCode: roomWithPlayers.code,
      host: roomWithPlayers.player.find((p) => p.isHost)?.name || null,
      players: roomWithPlayers.player.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
      })),
      gameType: roomWithPlayers.gameType ?? null,
      currentGame: roomWithPlayers.selectedGame ?? null,
    };
  };

  // 🟢 Тоглогч өрөөнд нэвтрэх
  socket.on("joinRoom", async ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) {
      socket.emit("joinError", {
        message: "Room code болон player name шаардлагатай.",
      });
      return;
    }

    try {
      const room = await prisma.room.findUnique({
        where: { code: roomCode },
      });

      if (!room) {
        socket.emit("joinError", {
          message: "Өрөө олдсонгүй. Кодоо шалгана уу.",
        });
        return;
      }

      socket.join(roomCode);

      // Энэ нэртэй тоглогч байгаа эсэхийг шалгах
      const existingPlayer = await prisma.player.findUnique({
        where: {
          name_roomId: {
            name: playerName,
            roomId: room.id,
          },
        },
      });

      let isHost = false;

      if (existingPlayer) {
        // өмнөх тоглогч → хост статус хадгална
        isHost = existingPlayer.isHost;
      } else {
        // Хэрэв өрөөнд хост байхгүй бол анхны тоглогчийг хост болгоно
        const hostExists = await prisma.player.count({
          where: { roomId: room.id, isHost: true },
        });
        isHost = hostExists === 0;
      }

      // Тоглогчийг шинээр үүсгэх эсвэл socketId-г шинэчлэх
      await prisma.player.upsert({
        where: {
          name_roomId: {
            name: playerName,
            roomId: room.id,
          },
        },
        update: { socketId: socket.id },
        create: {
          name: playerName,
          socketId: socket.id,
          roomId: room.id,
          isHost,
        },
      });

      // Өрөөний шинэ мэдээллийг бүх тоглогчдод илгээх
      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err: any) {
      console.error("joinRoom error:", err);
      socket.emit("joinError", {
        message: err.message || "Өрөөнд нэвтрэхэд алдаа гарлаа.",
      });
    }
  });

  // 🟢 Хост тоглоом сонгох
  socket.on("host:select_game", async ({ roomCode, gameType }) => {
    console.log("host:select_game ирлээ:", roomCode, gameType);
    try {
      await prisma.room.update({
        where: { code: roomCode },
        data: { selectedGame: gameType },
      });

      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err) {
      console.error("host:select_game error:", err);
      socket.emit("roomError", {
        message: "Тоглоом сонгоход алдаа гарлаа.",
      });
    }
  });

  // 🟢 Тоглогч гарах (socket тасрах үед)
  socket.on("disconnecting", async () => {
    try {
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id },
        include: { room: true },
      });

      if (!player) return;

      const { room, isHost, id: playerId, roomId } = player;
      const roomCode = room.code;

      // тоглогчийг устгах
      await prisma.player.delete({ where: { id: playerId } });

      const remainingPlayers = await prisma.player.findMany({
        where: { roomId },
      });

      // өрөөнд хүн үлдээгүй бол өрөөг устгана
      if (remainingPlayers.length === 0) {
        await prisma.room.delete({ where: { id: roomId } });
        return;
      }

      // хэрэв хост гарсан бол шинэ хост сонгоно
      if (isHost) {
        await prisma.player.update({
          where: { id: remainingPlayers[0].id },
          data: { isHost: true },
        });
      }

      // шинэчилсэн өрөөний мэдээлэл дамжуулах
      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });
}
