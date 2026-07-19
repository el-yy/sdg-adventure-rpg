import { ServerPlayer, ServerRoom, JoinRoomResult, LeaveRoomResult } from '../types';

export class RoomManager {
  private rooms: Map<string, ServerRoom> = new Map();

  joinRoom(roomId: string, player: ServerPlayer): JoinRoomResult {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        worldId: roomId.split('-')[0] || 'forest',
        hostId: player.uid,
        players: [],
        maxPlayers: 4,
        status: 'waiting',
        state: {},
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    const existingPlayer = room.players.find(p => p.uid === player.uid);
    if (existingPlayer) {
      existingPlayer.socketId = player.socketId;
      return { success: true };
    }

    room.players.push(player);
    return { success: true };
  }

  leaveRoom(socketId: string): LeaveRoomResult {
    for (const [roomId, room] of this.rooms) {
      const playerIndex = room.players.findIndex(p => p.socketId === socketId);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          this.rooms.delete(roomId);
          return { success: true, roomId };
        }

        if (room.hostId === player.uid && room.players.length > 0) {
          room.hostId = room.players[0].uid;
        }

        return { success: true, roomId };
      }
    }
    return { success: false };
  }

  getRoom(roomId: string): ServerRoom | undefined {
    return this.rooms.get(roomId);
  }

  updatePlayerPosition(socketId: string, position: { x: number; y: number }): void {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.position = position;
        return;
      }
    }
  }

  setPlayerReady(socketId: string, ready: boolean): void {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.isReady = ready;
        return;
      }
    }
  }

  getActiveRoomCount(): number {
    return Array.from(this.rooms.values()).filter(r => r.status === 'active').length;
  }

  getStats() {
    let totalPlayers = 0;
    for (const room of this.rooms.values()) {
      totalPlayers += room.players.length;
    }
    return {
      totalRooms: this.rooms.size,
      totalPlayers,
      activeRooms: this.getActiveRoomCount(),
    };
  }
}
