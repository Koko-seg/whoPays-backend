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
  shuffledQuestions: string[];
  currentIndex: number;
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
  "Хамгийн ууртай хүн хэн бэ?",
  "Хамгийн найдвартай хүн хэн бэ?",
];

function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

export function initVoteGame(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Автомат ROOM-д оруулах
   socket.on("autoJoin", (data:{nickname:string}, cb?) => {
  const code = "GAME";
  if (!rooms[code]) {
    rooms[code] = {
      code,
      players: [],
      currentQuestion: null,
      
      votes: {},
      shuffledQuestions: shuffle([...questions]),
      currentIndex: 1,
    };
  }

     const player: Player = {
    id: socket.id,
    name: data.nickname.trim() || `Player-${rooms[code].players.length + 1}`,
    score: 0,
  };

  rooms[code].players.push(player);

  
  socket.join(code);
  cb({ code, players: rooms[code].players });
  io.to(code).emit("roomUpdate", rooms[code]);
});

    // Host асуулт эхлүүлэх
    socket.on("startQuestion", (code: string) => {
      const room = rooms[code];
      if (!room) return;

      if (room.currentIndex >= room.shuffledQuestions.length) {
        // Тоглоом дууссан
        const maxScore = Math.max(...room.players.map((p) => p.score));
        const winners = room.players.filter((p) => p.score === maxScore);
        io.to(code).emit("gameOver", { winners, players: room.players });
        return;
      }
  const existingPlayer = rooms[code].players.find(p => p.id === socket.id);
  if (!existingPlayer) {
    const player: Player = {
      id: socket.id,
      name: `Player-${rooms[code].players.length + 1}`,
      score: 0,
    };
    rooms[code].players.push(player);
  }
      const q = room.shuffledQuestions[room.currentIndex];
      room.currentQuestion = q;
      room.votes = {};
      io.to(code).emit("newQuestion", q);
      io.to(code).emit("roomUpdate", room);
    });

    // Тоглогч санал өгөх
    socket.on("vote", (data: { code: string; votedId: string }) => {
      const room = rooms[data.code];
      if (!room) return;

      room.votes[socket.id] = data.votedId;
      io.to(data.code).emit("voteUpdate", room.votes);

      // Хэрэв бүх тоглогч санал өгсөн бол → дүн гаргана
      if (Object.keys(room.votes).length === room.players.length) {
        const counts: { [id: string]: number } = {};
        for (const v of Object.values(room.votes)) {
          counts[v] = (counts[v] || 0) + 1;
        }

        const max = Math.max(...Object.values(counts));
        const winners = Object.keys(counts).filter((id) => counts[id] === max);

        let winner: Player | null = null;
        if (winners.length === 1) {
          winner = room.players.find((p) => p.id === winners[0]) || null;
          if (winner) winner.score++;
        }

        io.to(data.code).emit("roundResult", { winner, counts });

        // Дараагийн асуулт руу шилжих
        room.currentIndex++;
      }
    });

    // Хэрэглэгч гарахад
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const room of Object.values(rooms)) {
        room.players = room.players.filter((p) => p.id !== socket.id);
        io.to(room.code).emit("roomUpdate", room);
      }
    });
  });
}