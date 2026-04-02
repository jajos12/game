import React from 'react';
import type { RoomHook } from './hooks/useRoom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';

interface AppProps {
  roomHook: RoomHook;
}

const App: React.FC<AppProps> = ({ roomHook }) => {

  if (!roomHook.roomState) {
    return <HomePage roomHook={roomHook} />;
  }

  return <GamePage roomHook={roomHook} />;
};

export default App;
