"use client";
import { useEffect, useState } from 'react';
import { getSocket } from '../lib/socket';
import { getToken } from '../lib/auth';

export default function CallNotification({ workspaceId }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const token = getToken();
  const socket = getSocket(token);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (callData) => {
      setIncomingCall(callData);
      setShowNotification(true);
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
      setShowNotification(false);
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_ended', handleCallEnded);
    socket.on('call_rejected', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_ended', handleCallEnded);
      socket.off('call_rejected', handleCallEnded);
    };
  }, [socket]);

  const acceptCall = () => {
    if (!socket || !incomingCall) return;
    
    socket.emit('accept_call', {
      callId: incomingCall.callId,
      workspaceId
    });
    
    setShowNotification(false);
    // Redirect to video tab
    window.location.hash = '#video';
  };

  const rejectCall = () => {
    if (!socket || !incomingCall) return;
    
    socket.emit('reject_call', {
      callId: incomingCall.callId,
      workspaceId
    });
    
    setIncomingCall(null);
    setShowNotification(false);
  };

  if (!showNotification || !incomingCall) return null;

  return (
    <div className="fixed top-4 right-4 bg-white border-2 border-blue-500 rounded-lg shadow-lg p-4 z-50 min-w-80">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">📹</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Incoming Video Call</h4>
          <p className="text-sm text-gray-600">
            {incomingCall.fromUser?.full_name || 'Someone'} is calling...
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={acceptCall}
          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          📹 Accept
        </button>
        <button
          onClick={rejectCall}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
        >
          ❌ Decline
        </button>
      </div>
    </div>
  );
}
