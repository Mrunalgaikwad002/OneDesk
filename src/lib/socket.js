import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket(token) {
  if (typeof window === 'undefined') return null;
  if (socketInstance && socketInstance.connected) return socketInstance;
  socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
    auth: { token },
    autoConnect: true,
    transports: ['websocket']
  });
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}


