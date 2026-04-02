export const SOCKET_EVENTS = {
  CREATE_ROOM: 'room:create',
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  START_GAME: 'room:start',
  SELECT_CARD: 'game:select-card',
  ROOM_STATE: 'room:state',
  ROOM_ERROR: 'room:error',
  PHASE_CHANGED: 'game:phase-changed',
  SELECTION_RESULT: 'game:selection-result',
  SCORE_UPDATED: 'game:score-updated',
  PLAYER_LOCKED: 'game:player-locked',
  GAME_FINISHED: 'game:finished',
} as const;
