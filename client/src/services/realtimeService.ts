import {
  onDisconnect,
  onValue,
  ref,
  remove,
  set,
  type Unsubscribe,
} from 'firebase/database';
import { realtimeDb } from './firebase';

export interface RoomPlayer {
  uid: string;
  displayName: string;
  level: number;
  position: { x: number; y: number };
  joinedAt: number;
}

const roomPlayersPath = (roomId: string) => `rooms/${roomId}/players`;

export async function joinRealtimeRoom(roomId: string, player: RoomPlayer): Promise<void> {
  const playerRef = ref(realtimeDb, `${roomPlayersPath(roomId)}/${player.uid}`);
  await set(playerRef, player);
  await onDisconnect(playerRef).remove();
}

export function leaveRealtimeRoom(roomId: string, uid: string): Promise<void> {
  return remove(ref(realtimeDb, `${roomPlayersPath(roomId)}/${uid}`));
}

export function watchRoomPlayers(
  roomId: string,
  callback: (players: Record<string, RoomPlayer>) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onValue(
    ref(realtimeDb, roomPlayersPath(roomId)),
    snapshot => callback((snapshot.val() || {}) as Record<string, RoomPlayer>),
    error => onError(error),
  );
}

export function updateRealtimePosition(roomId: string, uid: string, position: { x: number; y: number }): Promise<void> {
  return set(ref(realtimeDb, `${roomPlayersPath(roomId)}/${uid}/position`), position);
}
