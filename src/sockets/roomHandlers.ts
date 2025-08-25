import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";

export function roomHandlers(io: Server, socket: Socket) {
  socket.on("joinRoom", async ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) return;

    try {
      socket.join(roomCode);

      let room = await prisma.room.findUnique({
        where: { code: roomCode },
        include: { player: true },
      });

      if (!room) {
        room = await prisma.room.create({
          data: {
            code: roomCode,
            roomName: roomCode,
            player: {
              create: { name: playerName, isHost: true, socketId: socket.id },
            },
          },
          include: { player: true },
        });
      } else {
        const existing = room.player.find((p) => p.name === playerName);
        if (!existing) {
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
            where: { id: existing.id },
            data: { socketId: socket.id },
          });
        }

        room = await prisma.room.findUnique({
          where: { id: room.id },
          include: {  player: true },
        });
      }

      io.in(roomCode).emit("roomData", {
        host: room?.player.find((p) => p.isHost)?.name || null,
        players: room?.player.map((p) => p.name),
      });
    } catch (err) {
      console.error("joinRoom error:", err);
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
          await prisma.room.delete({ where: { id: player.roomId } });
        }
      }

      const updatedRoom = await prisma.room.findUnique({
        where: { id: player.roomId },
        include: { player: true },
      });

      if (updatedRoom) {
        io.in(roomCode).emit("roomData", {
          host: updatedRoom.player.find((p) => p.isHost)?.name || null,
          players: updatedRoom.player.map((p) => p.name),
        });
      }
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });
}
