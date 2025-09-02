"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticTacToeHandler = ticTacToeHandler;
const SIZE = 5;
const WIN_LENGTH = 4;
const rooms = {};
function checkWinner(board) {
    const getCell = (x, y) => board[y * SIZE + x];
    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const player = getCell(x, y);
            if (!player)
                continue;
            // Horizontal
            if (x + WIN_LENGTH - 1 < SIZE) {
                if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x + i, y) === player))
                    return player;
            }
            // Vertical
            if (y + WIN_LENGTH - 1 < SIZE) {
                if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x, y + i) === player))
                    return player;
            }
            // Diagonal ↘
            if (x + WIN_LENGTH - 1 < SIZE && y + WIN_LENGTH - 1 < SIZE) {
                if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x + i, y + i) === player))
                    return player;
            }
            // Diagonal ↙
            if (x - (WIN_LENGTH - 1) >= 0 && y + WIN_LENGTH - 1 < SIZE) {
                if ([...Array(WIN_LENGTH)].every((_, i) => getCell(x - i, y + i) === player))
                    return player;
            }
        }
    }
    return board.every((cell) => cell !== null) ? "tie" : null;
}
function ticTacToeHandler(io, socket) {
    socket.on("joinTicTacToe", (room) => {
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
    socket.on("makeTicTacToeMove", ({ room, index }) => {
        const game = rooms[room];
        if (!game || game.winner)
            return;
        if (game.board[index])
            return; // already taken
        game.board[index] = game.currentPlayer;
        // check winner
        const result = checkWinner(game.board);
        if (result) {
            game.winner = result;
        }
        else {
            game.currentPlayer = game.currentPlayer === "X" ? "O" : "X";
        }
        io.to(room).emit("ticTacToeState", game);
    });
    socket.on("resetTicTacToe", (room) => {
        rooms[room] = {
            board: Array(SIZE * SIZE).fill(null),
            currentPlayer: "X",
            winner: null,
        };
        io.to(room).emit("ticTacToeState", rooms[room]);
    });
}
