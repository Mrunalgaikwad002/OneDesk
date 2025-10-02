"use client";
import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../../lib/socket';
import { getToken } from '../../../lib/auth';
import { apiGet } from '../../../lib/api';

export default function ChatPanel({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);
  const loadedRoomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const token = getToken();
  const socket = getSocket(token);

  useEffect(() => {
    if (!socket || !roomId) return;
    
    // Load history only once per room
    if (loadedRoomRef.current !== roomId) {
      loadedRoomRef.current = roomId;
      setLoading(true);
      setMessages([]);
      setTypingUsers({});
      
      (async () => {
        if (roomId && roomId.startsWith('demo-room-')) {
          setMessages([
            { 
              id: 'demo-1',
              content: 'Welcome to the demo room!', 
              createdAt: '2025-10-02T10:00:00Z', 
              sender: { id: 'system', full_name: 'System', email: 'system@onedesk.com' } 
            },
            { 
              id: 'demo-2',
              content: 'This is a mock chat room for testing. Try sending a message!', 
              createdAt: '2025-10-02T10:01:00Z', 
              sender: { id: 'bot', full_name: 'OneDesk Bot', email: 'bot@onedesk.com' } 
            },
          ]);
          setLoading(false);
          return;
        }
        
        try {
          const res = await apiGet(`/api/chat/rooms/${roomId}/messages`, token);
          setMessages(res.messages || []);
        } catch (err) {
          console.error('Failed to load messages:', err);
          // Set empty messages for real rooms that fail to load
          setMessages([]);
        } finally {
          setLoading(false);
        }
      })();
    }

    // Join the chat room
    socket.emit('join_chat_room', roomId);

    // Listen for new messages
    const onNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    // Listen for message sent confirmation (for sender)
    const onMessageSent = (message) => {
      setMessages(prev => [...prev, message]);
    };

    // Listen for typing indicators
    const onUserTyping = ({ user, isTyping }) => {
      if (!user) return;
      
      setTypingUsers(prev => {
        const next = { ...prev };
        const userId = user.id || 'unknown';
        const userName = user.full_name || user.email || 'Someone';
        
        if (isTyping) {
          next[userId] = userName;
        } else {
          delete next[userId];
        }
        return next;
      });
    };

    // Listen for errors
    const onError = (error) => {
      // Only log meaningful errors, ignore empty objects
      if (error && (error.message || Object.keys(error).length > 0)) {
        console.error('Chat error:', error);
        if (error?.message) {
          console.error('Error details:', error.message);
        }
      }
    };

    socket.on('new_message', onNewMessage);
    socket.on('message_sent', onMessageSent);
    socket.on('user_typing', onUserTyping);
    socket.on('error', onError);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('message_sent', onMessageSent);
      socket.off('user_typing', onUserTyping);
      socket.off('error', onError);
      socket.emit('leave_chat_room', roomId);
    };
  }, [socket, roomId, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socket) return;
    
    // For demo rooms, add message locally
    if (roomId && roomId.startsWith('demo-room-')) {
      const demoMessage = {
        id: `demo-${Date.now()}`,
        content: text.trim(),
        createdAt: new Date().toISOString(),
        sender: { 
          id: 'current-user', 
          full_name: 'You', 
          email: 'you@example.com' 
        }
      };
      setMessages(prev => [...prev, demoMessage]);
      setText('');
      return;
    }

    // Send real message
    socket.emit('send_message', { 
      roomId, 
      content: text.trim(),
      messageType: 'text'
    });
    setText('');
  };

  const handleInputChange = (value) => {
    setText(value);
    
    if (!socket || !roomId || roomId.startsWith('demo-room-')) return;

    // Send typing start
    socket.emit('typing_start', { roomId });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { roomId });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <div className="h-72 flex items-center justify-center bg-white">
          <div className="text-gray-500">Loading messages...</div>
        </div>
      </div>
    );
  }

  const displayMessages = messages.length > 0 ? messages : [
    { 
      id: 'welcome',
      content: 'No messages yet. Start the conversation!', 
      createdAt: new Date().toISOString(), 
      sender: { full_name: 'System' } 
    }
  ];

  return (
    <div className="rounded-lg border overflow-hidden bg-white">
      <div className="p-3 border-b bg-gray-50">
        <div className="text-sm font-medium text-gray-900">
          Chat Room {roomId && roomId.startsWith('demo-room-') ? '(Demo)' : ''}
        </div>
      </div>
      
      <div ref={listRef} className="h-72 overflow-y-auto p-3 space-y-3 bg-white">
        {displayMessages.map((message) => (
          <div key={message.id || message.createdAt} className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-gray-900 text-sm">
                {message.sender?.full_name || message.sender?.email || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(message.createdAt)}
              </span>
            </div>
            <div className="text-sm text-gray-800 mt-1">
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(typingUsers).length > 0 && (
        <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
          <span className="italic">
            {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}
      
      <div className="flex gap-2 p-3 border-t bg-gray-50">
        <input 
          value={text} 
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..." 
          className="flex-1 rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
        />
        <button 
          onClick={sendMessage}
          disabled={!text.trim()}
          className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-4 py-2 text-sm font-medium hover:from-indigo-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}


