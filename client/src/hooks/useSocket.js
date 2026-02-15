import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
