export type PairDefinition = {
  id: string;
  title: string;
  image: string;
  hintA: string;
  hintB: string;
};

export type BoardCard = {
  cardId: string;
  pairId: string;
  image: string;
  hint: string;
  matched: boolean;
  matchedByPlayerId?: string;
};

export type PlayerState = {
  id: string;
  username: string;
  score: number;
  wrongStreak: number;
  lockedUntil: number;
  isHost: boolean;
  isConnected: boolean;
};

export type GamePhase = 'lobby' | 'loading' | 'memorize' | 'playing' | 'finished';

export type RoomState = {
  roomCode: string;
  hostId: string;
  players: PlayerState[];
  phase: GamePhase;
  board: BoardCard[];
  selections: Record<string, string[]>; // playerId -> cardIds
  scores: Record<string, number>;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  memorizeEndTime?: number;
};

export type ServerToClientEvents = {
  'room:state': (state: RoomState) => void;
  'room:error': (message: string) => void;
  'game:phase-changed': (phase: GamePhase) => void;
  'game:selection-result': (result: { playerId: string; cardIds: string[]; isMatch: boolean }) => void;
  'game:score-updated': (scores: Record<string, number>) => void;
  'game:player-locked': (payload: { playerId: string; lockedUntil: number }) => void;
  'game:finished': (winnerId: string | null) => void;
};

export type ClientToServerEvents = {
  'room:create': (username: string) => void;
  'room:join': (payload: { roomCode: string; username: string }) => void;
  'room:start': () => void;
  'game:select-card': (cardId: string) => void;
  'room:leave': () => void;
};
