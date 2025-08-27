import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";

export function roomHandlers(io: Server, socket: Socket) {
  // Өрөөний мэдээллийг авах туслах функц
  const getRoomData = async (roomCode: string) => {
    const roomWithPlayers = await prisma.room.findUnique({
      where: { code: roomCode },
      include: { player: true },
    });

    if (!roomWithPlayers) return null;

    return {
      roomCode: roomWithPlayers.code,
      host: roomWithPlayers.player.find((p) => p.isHost)?.name || null,
      players: roomWithPlayers.player.map((p) => p.name),
      selectedGame: roomWithPlayers.selectedGame ?? null,
      currentGame: roomWithPlayers.selectedGame ?? null,
    };
  };

  // Тоглогч өрөөнд нэвтрэх эвэнт
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

      // Өмнө нь энэ нэртэй тоглогч өрөөнд байсан эсэхийг шалгана
      const existingPlayer = await prisma.player.findUnique({
        where: {
          name_roomId: {
            name: playerName,
            roomId: room.id,
          },
        },
      });

      let isHost: boolean;

      if (existingPlayer) {
        // Хэрэв тоглогч өмнө нь байсан бол хост статусаа хадгална
        isHost = existingPlayer.isHost;
      } else {
        // Өрөөнд хост байгаа эсэхийг шалгаад, хост байхгүй бол энэ тоглогчийг хост болгоно
        const hostExists = await prisma.player.count({
          where: { roomId: room.id, isHost: true },
        });

        isHost = hostExists === 0;
      }

      // Тоглогчийг шинэчлэх буюу үүсгэх (upsert)
      await prisma.player.upsert({
        where: {
          name_roomId: {
            name: playerName,
            roomId: room.id,
          },
        },
        update: {
          socketId: socket.id,
        },
        create: {
          name: playerName,
          socketId: socket.id,
          roomId: room.id,
          isHost,
        },
      });

      // Өрөөний шинэчлэгдсэн мэдээллийг авах
      const updatedRoomData = await getRoomData(roomCode);

      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err: any) {
      console.error("joinRoom error:", err);
      socket.emit("joinError", { message: err.message || "Өрөөнд нэвтрэхэд алдаа гарлаа." });
    }
  });

  // Хост тоглоом сонгох эвэнт
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

  // Тоглогч холбогдож байгаа эвэнт
  socket.on("disconnecting", async () => {
    try {
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id },
        include: { room: true },
      });

      if (!player) return;

      const { room, isHost, id: playerId, roomId } = player;
      const roomCode = room.code;

      // Тоглогчийг устгана
      await prisma.player.delete({ where: { id: playerId } });

      const remainingPlayers = await prisma.player.findMany({
        where: { roomId: roomId },
      });

      // Хэрэв өрөөнд хүн үлдээгүй бол өрөөг устгана
      if (remainingPlayers.length === 0) {
        await prisma.room.delete({ where: { id: roomId } });
        return; // Цааш үргэлжлүүлэх шаардлагагүй
      }

      // Хэрэв хост гарсан бол шинэ хостыг томилно
      if (isHost) {
        await prisma.player.update({
          where: { id: remainingPlayers[0].id },
          data: { isHost: true },
        });
      }

      // Өрөөний шинэчилсэн мэдээллийг бүх тоглогчдод илгээх
      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });
}
