import { Server, Socket } from "socket.io";

type Player = "X" | "O";
type Board = (Player | null)[];

const SIZE = 5;
const WIN_LENGTH = 4;

interface RoomState {
  board: Board;
  currentPlayer: Player;
  winner: Player | "tie" | null;
}

const rooms: Record<string, RoomState> = {};

function checkWinner(board: Board): Player | "tie" | null {
  const getCell = (x: number, y: number) => board[y * SIZE + x];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const player = getCell(x, y);
      if (!player) continue;

      // Horizontal
      if (x + WIN_LENGTH - 1 < SIZE) {
        if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x + i, y) === player)) return player;
      }

      // Vertical
      if (y + WIN_LENGTH - 1 < SIZE) {
        if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x, y + i) === player)) return player;
      }

      // Diagonal ↘
      if (x + WIN_LENGTH - 1 < SIZE && y + WIN_LENGTH - 1 < SIZE) {
        if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x + i, y + i) === player)) return player;
      }

      // Diagonal ↙
      if (x - (WIN_LENGTH - 1) >= 0 && y + WIN_LENGTH - 1 < SIZE) {
        if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x - i, y + i) === player)) return player;
      }
    }
  }

  return board.every((cell) => cell !== null) ? "tie" : null;
}

export function ticTacToeHandler(io: Server, socket: Socket) {
  socket.on("joinTicTacToe", (room: string) => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        board: Array(SIZE * SIZE).fill(null),
        currentPlayer: "X",
        winner: null,
      };
    }

    socket.emit("ticTacToeState", rooms[room]);
  });

  socket.on("makeTicTacToeMove", ({ room, index }: { room: string; index: number }) => {
    const game = rooms[room];
    if (!game || game.winner) return;

    if (game.board[index]) return; // already taken
    game.board[index] = game.currentPlayer;

    // check winner
    const result = checkWinner(game.board);
    if (result) {
      game.winner = result;
    } else {
      game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
    }

    io.to(room).emit("ticTacToeState", game);
  });

  socket.on("resetTicTacToe", (room: string) => {
    rooms[room] = {
      board: Array(SIZE * SIZE).fill(null),
      currentPlayer: "X",
      winner: null,
    };
    io.to(room).emit("ticTacToeState", rooms[room]);
  });
}
