export interface ServerPlayer {
  uid: string;
  displayName: string;
  level: number;
  position: { x: number; y: number };
  isReady: boolean;
  socketId: string;
}

export interface ServerRoom {
  id: string;
  worldId: string;
  hostId: string;
  players: ServerPlayer[];
  maxPlayers: number;
  status: 'waiting' | 'active' | 'completed';
  questId?: string;
  state: Record<string, unknown>;
  createdAt: number;
}

export interface JoinRoomResult {
  success: boolean;
  error?: string;
}

export interface LeaveRoomResult {
  success: boolean;
  roomId?: string;
}
