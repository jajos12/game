import { Server, Socket } from 'socket.io';
import type { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  PlayerState, 
  RoomState, 
  BoardCard
} from '../shared/types.js';
import { SOCKET_EVENTS } from '../shared/events.js';
import { generateRoomCode } from './utils/roomCode.js';
import { shuffle } from './utils/shuffle.js';
import { rooms } from './rooms/roomStore.js';
import { CARD_PAIRS } from './game/cards.js';

export function setupSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log('User connected:', socket.id);

    socket.on(SOCKET_EVENTS.CREATE_ROOM, (username: string) => {
      const roomCode = generateRoomCode();
      const player: PlayerState = {
        id: socket.id,
        username,
        score: 0,
        wrongStreak: 0,
        lockedUntil: 0,
        isHost: true,
        isConnected: true
      };

      const roomState: RoomState = {
        roomCode,
        hostId: socket.id,
        players: [player],
        phase: 'lobby',
        board: [],
        selections: {},
        scores: { [socket.id]: 0 },
        createdAt: Date.now()
      };

      rooms.set(roomCode, roomState);
      socket.join(roomCode);
      socket.emit(SOCKET_EVENTS.ROOM_STATE, roomState);
      console.log(`Room created: ${roomCode} by ${username}`);
    });

    socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomCode, username }: { roomCode: string, username: string }) => {
      const room = rooms.get(roomCode.toUpperCase());
      if (!room) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, 'Room not found');
        return;
      }

      if (room.phase !== 'lobby') {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, 'Game already in progress');
        return;
      }

      const player: PlayerState = {
        id: socket.id,
        username,
        score: 0,
        wrongStreak: 0,
        lockedUntil: 0,
        isHost: false,
        isConnected: true
      };

      room.players.push(player);
      room.scores[socket.id] = 0;
      socket.join(roomCode.toUpperCase());
      io.to(roomCode.toUpperCase()).emit(SOCKET_EVENTS.ROOM_STATE, room);
      console.log(`User ${username} joined room ${roomCode}`);
    });

    socket.on(SOCKET_EVENTS.START_GAME, () => {
      const room = findRoomBySocketId(socket.id);
      if (!room || room.hostId !== socket.id) return;

      // Initialize board
      const board: BoardCard[] = [];
      CARD_PAIRS.forEach(pair => {
        // Card A with Hint A
        board.push({
          cardId: `${pair.id}-a`,
          pairId: pair.id,
          image: pair.image,
          hint: pair.hintA,
          matched: false
        });
        // Card B with Hint B
        board.push({
          cardId: `${pair.id}-b`,
          pairId: pair.id,
          image: pair.image,
          hint: pair.hintB,
          matched: false
        });
      });

      room.board = shuffle(board);
      room.phase = 'memorize';
      room.startedAt = Date.now();
      room.memorizeEndTime = Date.now() + 5000; // 5 seconds

      io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);

      // After 12 seconds, switch to playing phase
      setTimeout(() => {
        if (room.phase === 'memorize') {
          room.phase = 'playing';
          io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
        }
      }, 12000);
    });

    socket.on(SOCKET_EVENTS.SELECT_CARD, (cardId: string) => {
      const room = findRoomBySocketId(socket.id);
      if (!room || room.phase !== 'playing') return;

      const player = room.players.find((p: PlayerState) => p.id === socket.id);
      if (!player) return;

      // Check lockout
      if (Date.now() < player.lockedUntil) return;

      const card = room.board.find((c: BoardCard) => c.cardId === cardId);
      if (!card || card.matched) return;

      if (!room.selections[socket.id]) {
        room.selections[socket.id] = [];
      }

      const playerSelections = room.selections[socket.id];

      // Don't allow selecting the same card twice
      if (playerSelections.includes(cardId)) return;

      // Allow only two selections
      if (playerSelections.length >= 2) return;

      playerSelections.push(cardId);
      io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);

      if (playerSelections.length === 2) {
        const [id1, id2] = playerSelections;
        const card1 = room.board.find((c: BoardCard) => c.cardId === id1)!;
        const card2 = room.board.find((c: BoardCard) => c.cardId === id2)!;

        const isMatch = card1.pairId === card2.pairId;

        if (isMatch) {
          // Correct match
          card1.matched = true;
          card2.matched = true;
          card1.matchedByPlayerId = socket.id;
          card2.matchedByPlayerId = socket.id;
          
          room.scores[socket.id] += 15; // +15 points
          player.score += 15;
          player.wrongStreak = 0;

          io.to(room.roomCode).emit(SOCKET_EVENTS.SELECTION_RESULT, {
            playerId: socket.id,
            cardIds: [id1, id2],
            isMatch: true
          });

          // Reset selections immediately
          room.selections[socket.id] = [];

          // Check for game end
          if (room.board.every((c: BoardCard) => c.matched)) {
            room.phase = 'finished';
            room.endedAt = Date.now();
            io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
          } else {
            io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
          }
        } else {
          // Wrong match
          player.wrongStreak++;
          
          let penalty = 1;
          if (player.wrongStreak === 2) penalty = 2;
          else if (player.wrongStreak >= 3) penalty = 5;

          room.scores[socket.id] -= penalty; // Allow negative scores
          player.score = room.scores[socket.id];

          // Lock only after 5+ consecutive wrong attempts — 3s lockout
          if (player.wrongStreak >= 5) {
            player.lockedUntil = Date.now() + 3000;
          }

          io.to(room.roomCode).emit(SOCKET_EVENTS.SELECTION_RESULT, {
            playerId: socket.id,
            cardIds: [id1, id2],
            isMatch: false
          });

          if (player.wrongStreak >= 5) {
            io.to(room.roomCode).emit(SOCKET_EVENTS.PLAYER_LOCKED, {
              playerId: socket.id,
              lockedUntil: player.lockedUntil
            });
          }

          // Show the mistake for a shorter time then reset selections
          // If they triggered a lockout, lock for 3s, but still flip back earlier (1.2s)
          const flipDelay = player.wrongStreak >= 5 ? 1200 : 600;
          
          setTimeout(() => {
            room.selections[socket.id] = [];
            // Also clear lock after the timeout if expired (though usually it expires later)
            if (player.lockedUntil > 0 && Date.now() >= player.lockedUntil) {
              player.lockedUntil = 0;
            }
            io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
          }, flipDelay);
        }
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, () => {
      handleDisconnect(socket, io);
    });

    socket.on('disconnect', () => {
      handleDisconnect(socket, io);
    });
  });
}

function findRoomBySocketId(socketId: string): RoomState | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((p: PlayerState) => p.id === socketId)) {
      return room;
    }
  }
  return undefined;
}

function handleDisconnect(socket: Socket, io: Server) {
  const room = findRoomBySocketId(socket.id);
  if (!room) return;

  room.players = room.players.filter((p: PlayerState) => p.id !== socket.id);
  
  if (room.players.length === 0) {
    rooms.delete(room.roomCode);
  } else {
    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
    }
    io.to(room.roomCode).emit(SOCKET_EVENTS.ROOM_STATE, room);
  }
}
