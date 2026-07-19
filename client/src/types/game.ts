export interface GameState {
  currentWorld: string | null;
  currentQuest: string | null;
  playerPosition: { x: number; y: number };
  isInGame: boolean;
  isMultiplayer: boolean;
  roomId: string | null;
}

export interface AuthState {
  user: unknown | null;
  isLoading: boolean;
  error: string | null;
}
