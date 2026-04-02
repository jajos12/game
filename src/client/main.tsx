import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { SocketProvider } from './context/SocketContext';
import { useRoom } from './hooks/useRoom';

const Root = () => {
  const roomHook = useRoom();
  return <App roomHook={roomHook} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SocketProvider>
      <Root />
    </SocketProvider>
  </React.StrictMode>
);
