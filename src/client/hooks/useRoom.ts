import { useState, useEffect, useCallback } from 'react';
import type { RoomState } from '../../shared/types';
import { SOCKET_EVENTS } from '../../shared/events';
import { useSocket } from '../context/SocketContext';

export const useRoom = () => {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const onRoomState = (state: RoomState) => {
      setRoomState(state);
      setError(null);
    };

    const onRoomError = (msg: string) => {
      setError(msg);
    };

    socket.on(SOCKET_EVENTS.ROOM_STATE as any, onRoomState);
    socket.on(SOCKET_EVENTS.ROOM_ERROR as any, onRoomError);

    return () => {
      socket.off(SOCKET_EVENTS.ROOM_STATE as any, onRoomState);
      socket.off(SOCKET_EVENTS.ROOM_ERROR as any, onRoomError);
    };
  }, [socket]);

  const createRoom = useCallback((username: string) => {
    setError(null);
    socket?.emit(SOCKET_EVENTS.CREATE_ROOM as any, username);
  }, [socket]);

  const joinRoom = useCallback((roomCode: string, username: string) => {
    setError(null);
    socket?.emit(SOCKET_EVENTS.JOIN_ROOM as any, { roomCode, username });
  }, [socket]);

  const startGame = useCallback(() => {
    socket?.emit(SOCKET_EVENTS.START_GAME as any);
  }, [socket]);

  const selectCard = useCallback((cardId: string) => {
    socket?.emit(SOCKET_EVENTS.SELECT_CARD as any, cardId);
  }, [socket]);

  const leaveRoom = useCallback(() => {
    socket?.emit(SOCKET_EVENTS.LEAVE_ROOM as any);
    setRoomState(null);
  }, [socket]);

  return {
    roomState,
    error,
    createRoom,
    joinRoom,
    startGame,
    selectCard,
    leaveRoom,
    playerId: socket?.id ?? undefined
  };
};

export type RoomHook = ReturnType<typeof useRoom>;
