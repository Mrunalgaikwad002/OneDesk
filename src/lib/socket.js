import { io } from 'socket.io-client';

let socketInstance = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

export function getSocket(token) {
  if (typeof window === 'undefined') return null;
  if (!token) return null;
  
  // Return existing connected socket
  if (socketInstance && socketInstance.connected) return socketInstance;
  
  // Don't try to reconnect if we've failed too many times
  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.warn('Socket connection disabled after max attempts');
    return null;
  }

  try {
    socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'https://onedesk-backend.onrender.com', {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
      connectionAttempts = 0; // Reset on successful connection
    });

    socketInstance.on('connect_error', (error) => {
      connectionAttempts++;
      console.log(`Socket connection attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS} failed. Operating in demo mode.`);
      
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        console.log('Socket unavailable. App will work in demo mode.');
        if (socketInstance) {
          socketInstance.disconnect();
          socketInstance = null;
        }
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    return socketInstance;
  } catch (error) {
    console.error('Failed to create socket instance:', error);
    connectionAttempts++;
    return null;
  }
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  connectionAttempts = 0;
}


