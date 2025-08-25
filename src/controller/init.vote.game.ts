import { Server, Socket } from "socket.io";

type Player = {
  id: string;
  name: string;
  score: number;
};

type Room = {
  code: string;
  players: Player[];
  currentQuestion: string | null;
  votes: { [voterId: string]: string };
};

const rooms: { [code: string]: Room } = {};
const questions = [
  "Хамгийн хөгжилтэй хүн хэн бэ?",
  "Хамгийн ухаантай хүн хэн бэ?",
  "Хамгийн азтай хүн хэн бэ?",
  "Хамгийн их хоцордог хүн хэн бэ?",
  "Хамгийн их ярьдаг хүн хэн бэ?",
  "Хамгийн их инээдэг хүн хэн бэ?",
  "Хамгийн их хоол иддэг хүн хэн бэ?",
  "Хамгийн их утсаа ширтдэг хүн хэн бэ?",
  "Хамгийн их ууртай хүн хэн бэ?",
  "Хамгийн найдвартай хүн хэн бэ?",
  "Хамгийн залхуу хүн хэн бэ?",
  "Хамгийн эрт унтдаг хүн хэн бэ?",
  "Хамгийн орой унтдаг хүн хэн бэ?",
  "Хамгийн спортлог хүн хэн бэ?",
  "Хамгийн их шоглодог хүн хэн бэ?",
  "Хамгийн хөөрхөн инээмсэглэлтэй хүн хэн бэ?",
  "Хамгийн дуу муутай хүн хэн бэ?",
  "Хамгийн их хөгжим сонсдог хүн хэн бэ?",
  "Хамгийн олон хошигнол мэддэг хүн хэн бэ?",
  "Хамгийн их кофе уудаг хүн хэн бэ?",
];

export function initVoteGame(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // 🟢 ШУУД ROOM-д оруулах
    socket.on("autoJoin", (cb) => {
      const code = "GAME";
      if (!rooms[code]) {
        rooms[code] = { code, players: [], currentQuestion: null, votes: {} };
      }

      rooms[code].players.push({ id: socket.id, name: `Player-${rooms[code].players.length + 1}`, score: 0 });
      socket.join(code);
      cb({ code, players: rooms[code].players });
      io.to(code).emit("roomUpdate", rooms[code]);
    });

    // 🟢 Асуулт эхлүүлэх
    socket.on("startQuestion", (code: string) => {
      const room = rooms[code];
      if (!room) return;
      const q = questions[Math.floor(Math.random() * questions.length)];
      room.currentQuestion = q;
      room.votes = {};
      io.to(code).emit("newQuestion", q);
    });

    // 🟢 Санал өгөх
    socket.on("vote", (data: { code: string; votedId: string }) => {
      const room = rooms[data.code];
      if (!room) return;

      room.votes[socket.id] = data.votedId;
      io.to(data.code).emit("voteUpdate", room.votes);

      if (Object.keys(room.votes).length === room.players.length) {
        const counts: { [id: string]: number } = {};
        for (const v of Object.values(room.votes)) counts[v] = (counts[v] || 0) + 1;

        const max = Math.max(...Object.values(counts));
        const winners = Object.keys(counts).filter((id) => counts[id] === max);

        if (winners.length === 1) {
          const winner = room.players.find((p) => p.id === winners[0]);
          if (winner) winner.score++;
          io.to(data.code).emit("roundResult", { winner, counts });
        } else {
          io.to(data.code).emit("roundResult", { winner: null, counts });
        }

        io.to(data.code).emit("roomUpdate", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const room of Object.values(rooms)) {
        room.players = room.players.filter((p) => p.id !== socket.id);
        io.to(room.code).emit("roomUpdate", room);
      }
    });
  });
}
