import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(roomId: string): void {
  const s = getSocket();
  s.emit('join-room', roomId);
}

export function leaveRoom(roomId: string): void {
  const s = getSocket();
  s.emit('leave-room', roomId);
}

export function sendPlayerMove(roomId: string, position: { x: number; y: number }): void {
  const s = getSocket();
  s.emit('player-move', roomId, position);
}

export function sendQuestProgress(roomId: string, questId: string, stepId: string): void {
  const s = getSocket();
  s.emit('quest-progress', roomId, questId, stepId);
}

export function onRoomState(callback: (state: unknown) => void): () => void {
  const s = getSocket();
  s.on('room-state', callback);
  return () => { s.off('room-state', callback); };
}

export function onPlayerJoined(callback: (player: unknown) => void): () => void {
  const s = getSocket();
  s.on('player-joined', callback);
  return () => { s.off('player-joined', callback); };
}

export function onPlayerLeft(callback: (uid: string) => void): () => void {
  const s = getSocket();
  s.on('player-left', callback);
  return () => { s.off('player-left', callback); };
}

export function onPlayerMoved(callback: (uid: string, position: { x: number; y: number }) => void): () => void {
  const s = getSocket();
  s.on('player-moved', callback);
  return () => { s.off('player-moved', callback); };
}

export function onQuestUpdated(callback: (questId: string, stepId: string) => void): () => void {
  const s = getSocket();
  s.on('quest-updated', callback);
  return () => { s.off('quest-updated', callback); };
}
