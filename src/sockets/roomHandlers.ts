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
      host: roomWithPlayers.player.find((p) => p.isHost)?.name || null,
      players: roomWithPlayers.player.map((p) => p.name),
    };
  };
 socket.on("joinRoom", async ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) {
      // ... existing code ...
      return;
    }

    try {
      const room = await prisma.room.findUnique({
        where: { code: roomCode },
      });

      if (!room) {
        socket.emit("joinError", {
          message: "Өрөө олдсонгүй. Кодоо зөв эсэхийг шалгана уу.",
        });
        return;
      }

      socket.join(roomCode);

      // Өрөөнд хост байгаа эсэхийг урьдчилан шалгана
      const hostExists = await prisma.player.count({
        where: { roomId: room.id, isHost: true },
      });

      // UPSERT ашиглан уралдааны нөхцөлийг арилгана
      await prisma.player.upsert({
        where: {
          // Тоглогчийг нэр болон өрөөний ID-аар нь давхцуулахгүйгээр хайна
          // Энэ нь таны schema.prisma файлд @@unique([name, roomId]) тохиргоо шаардана
          name_roomId: {
            name: playerName,
            roomId: room.id,
          },
        },
        // Хэрэв тоглогч олдвол эндхийг ажиллуулна
        update: {
          socketId: socket.id,
        },
        // Хэрэв тоглогч олдохгүй бол эндхийг ажиллуулна
        create: {
          name: playerName,
          socketId: socket.id,
          roomId: room.id,
          isHost: hostExists === 0, // Хэрэв хост байхгүй бол энэ тоглогчийг хост болгоно
        },
      });

      const updatedRoomData = await getRoomData(roomCode); // Энэ функцийг өмнөх хариултаас авна уу
      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err: any) {
      console.error("joinRoom error:", err);
      const errorMessage = err.message || "Өрөөнд нэвтрэхэд тодорхойгүй алдаа гарлаа.";
      socket.emit("joinError", { message: errorMessage });
    }
  });
 socket.on("host:select_game", async ({ roomId, gameType }) => {
  try {
    // тухайн room-ийн selectedGame-г шинэчилнэ
    await prisma.room.update({
      where: { code: roomId },
      data: { selectedGame: gameType },
    });

    const updatedRoomData = await getRoomData(roomId); // selectedGame-г буцаах байдлаар шинэчил
    if (updatedRoomData) {
      io.in(roomId).emit("roomData", updatedRoomData);
    }
  } catch (err) {
    console.error("host:select_game error:", err);
    socket.emit("roomError", {
      message: "Тоглоом сонгоход алдаа гарлаа.",
    });
  }
});

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
        return; // Цааш ажиллах шаардлагагүй
      }

      // Хэрэв гарсан тоглогч хост байсан бол шинэ хост томилно
      if (isHost) {
        await prisma.player.update({
          where: { id: remainingPlayers[0].id },
          data: { isHost: true },
        });
      }

      // Өрөөний мэдээллийг шинэчилж бүгдэд мэдээлнэ
      const updatedRoomData = await getRoomData(roomCode);
      if (updatedRoomData) {
        io.in(roomCode).emit("roomData", updatedRoomData);
      }
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });
}