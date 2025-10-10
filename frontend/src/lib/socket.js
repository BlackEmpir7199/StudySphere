import { io } from 'socket.io-client';

// Use current origin for Socket.io (nginx proxies /socket.io/ to chat-service)
const SOCKET_URL = window.location.origin;

let socket = null;

export const initSocket = () => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    withCredentials: true, // This sends cookies automatically
    transports: ['websocket', 'polling'],
    path: '/socket.io/',
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

