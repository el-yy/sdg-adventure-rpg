import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './rooms/RoomManager';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const roomManager = new RoomManager();

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Player connected: ${socket.id}`);

  socket.on('join-room', (roomId: string, playerData: { uid: string; displayName: string; level: number }) => {
    const result = roomManager.joinRoom(roomId, {
      uid: playerData.uid,
      displayName: playerData.displayName,
      level: playerData.level,
      position: { x: 480, y: 320 },
      isReady: false,
      socketId: socket.id,
    });

    if (result.success) {
      socket.join(roomId);
      const room = roomManager.getRoom(roomId);
      socket.emit('room-state', room);
      socket.to(roomId).emit('player-joined', playerData);
      console.log(`[Socket] ${playerData.displayName} joined room ${roomId}`);
    } else {
      socket.emit('room-error', { message: result.error });
    }
  });

  socket.on('leave-room', (roomId: string) => {
    const result = roomManager.leaveRoom(socket.id);
    if (result.success) {
      socket.leave(roomId);
      socket.to(roomId).emit('player-left', socket.id);
      console.log(`[Socket] Player ${socket.id} left room ${roomId}`);
    }
  });

  socket.on('player-move', (roomId: string, position: { x: number; y: number }) => {
    roomManager.updatePlayerPosition(socket.id, position);
    socket.to(roomId).emit('player-moved', socket.id, position);
  });

  socket.on('quest-progress', (roomId: string, questId: string, stepId: string) => {
    socket.to(roomId).emit('quest-updated', questId, stepId);
    console.log(`[Socket] Quest progress in room ${roomId}: ${questId} - ${stepId}`);
  });

  socket.on('team-action', (roomId: string, action: string, data: unknown) => {
    socket.to(roomId).emit('team-action', action, data);
  });

  socket.on('player-ready', (roomId: string) => {
    roomManager.setPlayerReady(socket.id, true);
    const room = roomManager.getRoom(roomId);
    if (room) {
      io.to(roomId).emit('room-state', room);
    }
  });

  socket.on('start-mission', (roomId: string) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.players.length >= 2) {
      room.status = 'active';
      io.to(roomId).emit('mission-started', room);
    }
  });

  socket.on('disconnect', () => {
    const result = roomManager.leaveRoom(socket.id);
    if (result.roomId) {
      io.to(result.roomId).emit('player-left', socket.id);
      console.log(`[Socket] Player disconnected from room ${result.roomId}`);
    }
    console.log(`[Socket] Player disconnected: ${socket.id}`);
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);

httpServer.listen(PORT, () => {
  console.log(`[Server] SDG Adventure RPG Socket.io server running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});

export { app, io };
