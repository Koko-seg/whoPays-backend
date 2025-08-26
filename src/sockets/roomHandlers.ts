import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";

export function roomHandlers(io: Server, socket: Socket) {
  socket.on("joinRoom", async ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) {
      socket.emit("joinError", {
        message: "Өрөөний код болон нэр хоосон байна.",
      });
      return;
    }

    try {
      let room = await prisma.room.findUnique({
        where: { code: roomCode },
        include: { player: true },
      });
      if (!room) {
        socket.emit("joinError", {
          message: "Өрөө олдсонгүй. Кодоо зөв эсэхийг шалгана уу.",
        });
        return;
      }
      socket.join(roomCode);

      const existingPlayer = room.player.find((p) => p.name === playerName);

      console.log("Existing player:", existingPlayer);

      if (!existingPlayer) {
        await prisma.player.create({
          data: {
            name: playerName,
            isHost: room.player.length === 0,

            roomId: room.id,
            socketId: socket.id,
          },
        });
      } else {
        await prisma.player.update({
          where: { id: existingPlayer.id },
          data: { socketId: socket.id },
        });
      }

      const roomData = await prisma.room.findUnique({
        where: { code: roomCode },
        include: { player: true },
      });

      if (roomData) {
        io.in(roomCode).emit("roomData", {
          roomCode: roomData.code,
          host: roomData.player.find((p) => p.isHost)?.name || null,
          players: roomData.player.map((p) => p.name),
        });
      }
    } catch (err) {
      console.error("joinRoom error:", err);
      socket.emit("joinError", {
        message: err || "Өрөө нэвтрэхэд алдаа гарлаа.",
      });
    }
  });

  socket.on("disconnecting", async () => {
    try {
      const player = await prisma.player.findFirst({
        where: { socketId: socket.id },
        include: { room: { include: { player: true } } },
      });

      if (!player) return;

      const roomCode = player.room.code;

      await prisma.player.delete({ where: { id: player.id } });

      const remaining = await prisma.player.findMany({
        where: { roomId: player.roomId },
      });

      if (player.isHost) {
        if (remaining.length > 0) {
          await prisma.player.update({
            where: { id: remaining[0].id },
            data: { isHost: true },
          });
        } else {
          // If the last player leaves, delete the room.
          await prisma.room.delete({ where: { id: player.roomId } });
          return;
        }
      }

      const updatedRoom = await prisma.room.findUnique({
        where: { code: roomCode },
        include: { player: true },
      });

      if (updatedRoom) {
        io.in(roomCode).emit("roomData", {
          roomCode: updatedRoom.code,
          host: updatedRoom.player.find((p) => p.isHost)?.name || null,
          players: updatedRoom.player.map((p) => p.name),
        });
      }
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });
}
