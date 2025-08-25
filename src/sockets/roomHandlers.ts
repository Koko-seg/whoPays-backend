import { Server, Socket } from "socket.io";
import prisma from "../utils/prisma";

export function roomHandlers(io: Server, socket: Socket) {
  socket.on("joinRoom", async ({ roomCode, playerName }) => {
    if (!roomCode || !playerName) return;

    try {
      socket.join(roomCode);

      let room = await prisma.room.findUnique({
        where: { code: roomCode },
        include: { participants: true },
      });

      if (!room) {
        room = await prisma.room.create({
          data: {
            code: roomCode,
            roomName: roomCode,
            participants: {
              create: { name: playerName, isHost: true, socketId: socket.id },
            },
          },
          include: { participants: true },
        });
      } else {
        const existing = room.participants.find((p) => p.name === playerName);
        if (!existing) {
          await prisma.participant.create({
            data: {
              name: playerName,
              isHost: room.participants.length === 0,
              roomId: room.id,
              socketId: socket.id,
            },
          });
        } else {
          await prisma.participant.update({
            where: { id: existing.id },
            data: { socketId: socket.id },
          });
        }

        room = await prisma.room.findUnique({
          where: { id: room.id },
          include: { participants: true },
        });
      }

      io.in(roomCode).emit("roomData", {
        host: room?.participants.find((p) => p.isHost)?.name || null,
        players: room?.participants.map((p) => p.name),
      });
    } catch (err) {
      console.error("joinRoom error:", err);
    }
  });

  socket.on("disconnecting", async () => {
    try {
      const participant = await prisma.participant.findFirst({
        where: { socketId: socket.id },
        include: { room: { include: { participants: true } } },
      });

      if (!participant) return;
      const roomCode = participant.room.code;

      await prisma.participant.delete({ where: { id: participant.id } });

      const remaining = await prisma.participant.findMany({
        where: { roomId: participant.roomId },
      });

      if (participant.isHost) {
        if (remaining.length > 0) {
          await prisma.participant.update({
            where: { id: remaining[0].id },
            data: { isHost: true },
          });
        } else {
          await prisma.room.delete({ where: { id: participant.roomId } });
        }
      }

      const updatedRoom = await prisma.room.findUnique({
        where: { id: participant.roomId },
        include: { participants: true },
      });

      if (updatedRoom) {
        io.in(roomCode).emit("roomData", {
          host: updatedRoom.participants.find((p) => p.isHost)?.name || null,
          players: updatedRoom.participants.map((p) => p.name),
        });
      }
    } catch (err) {
      console.error("disconnecting error:", err);
    }
  });
}
