import type { RoomState } from '../../shared/types.js';

export const rooms = new Map<string, RoomState>();

export const getRoom = (code: string) => rooms.get(code);
export const setRoom = (code: string, state: RoomState) => rooms.set(code, state);
export const deleteRoom = (code: string) => rooms.delete(code);

// Optional: Cleanup old rooms
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > 1000 * 60 * 60 * 4) { // 4 hours
      rooms.delete(code);
    }
  }
}, 1000 * 60 * 6)
