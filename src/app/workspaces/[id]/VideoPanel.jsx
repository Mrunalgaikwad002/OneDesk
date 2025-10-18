"use client";
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { getSocket } from '../../../lib/socket';
import { getToken } from '../../../lib/auth';

export default function VideoPanel({ workspaceId = 'demo-workspace' }) {
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callId, setCallId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [lastMediaError, setLastMediaError] = useState('');
  
  const myVideo = useRef(null);
  const peersRef = useRef({});
  const token = getToken();
  const socket = getSocket(token);

  // Get user media
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(async mediaStream => {
        setLastMediaError('');
        setStream(mediaStream);
        if (myVideo.current) {
          myVideo.current.srcObject = mediaStream;
          try { await myVideo.current.play(); } catch (e) {}
        }
      })
      .catch(err => {
        console.log('Media access denied:', err);
        setLastMediaError(err?.name || 'MediaError');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !stream) return;

    // Join workspace for video signaling
    socket.emit('join_workspaces', [workspaceId]);

    const handleIncomingCall = ({ callId, fromUser, participants }) => {
      setIncomingCall({ callId, fromUser, participants });
      setShowCallPopup(true);
    };

    const handleCallAccepted = ({ callId, participants }) => {
      setCallId(callId);
      setParticipants(participants);
      setInCall(true);
      setShowCallPopup(false);
      initializeCall(participants);
    };

    const handleUserJoined = ({ userId, signal }) => {
      if (userId !== socket.id) {
        const peer = createPeer(userId, stream, signal);
        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    };

    const handleSignal = ({ signal, fromUser }) => {
      const peer = peersRef.current[fromUser];
      if (peer) {
        peer.signal(signal);
      }
    };

    const handleUserLeft = ({ userId }) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
      setParticipants(prev => prev.filter(p => p !== userId));
    };

    const handleCallEnded = () => {
      endCall();
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('user_joined_call', handleUserJoined);
    socket.on('call_signal', handleSignal);
    socket.on('user_left_call', handleUserLeft);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('user_joined_call', handleUserJoined);
      socket.off('call_signal', handleSignal);
      socket.off('user_left_call', handleUserLeft);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, stream, workspaceId]);

  const createPeer = (userToSignal, callerStream, signal) => {
    const peer = new Peer({
      initiator: !signal,
      trickle: false,
      stream: callerStream,
    });

    if (signal) {
      peer.signal(signal);
    }

    peer.on('signal', signal => {
      if (socket) {
        socket.emit('call_signal', {
          userToSignal,
          signal,
          workspaceId
        });
      }
    });

    return peer;
  };

  const initializeCall = (participantIds) => {
    participantIds.forEach(userId => {
      if (userId !== socket?.id) {
        const peer = createPeer(userId, stream);
        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    });
  };

  const ensureLocalStream = async () => {
    if (stream) return stream;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
        try { await myVideo.current.play(); } catch (e) {}
      }
      setLastMediaError('');
      return mediaStream;
    } catch (err) {
      console.log('Media access denied or unavailable:', err);
      setLastMediaError(err?.name || 'MediaError');
      return null;
    }
  };

  const startCall = async () => {
    if (!socket) {
      alert('Socket connection not available');
      return;
    }

    const haveStream = await ensureLocalStream();
    if (!haveStream) {
      alert('Unable to access camera/microphone. Please allow permissions and try again.');
      return;
    }

    const newCallId = `call-${Date.now()}`;
    setCallId(newCallId);

    socket.emit('start_call', {
      callId: newCallId,
      workspaceId,
      callType: 'group'
    });

    setInCall(true);
  };

  const acceptCall = () => {
    if (!socket || !incomingCall) return;
    
    socket.emit('accept_call', {
      callId: incomingCall.callId,
      workspaceId
    });
    
    setIncomingCall(null);
  };

  const rejectCall = () => {
    if (!socket || !incomingCall) return;
    
    socket.emit('reject_call', {
      callId: incomingCall.callId,
      workspaceId
    });
    
    setIncomingCall(null);
    setShowCallPopup(false);
  };

  const endCall = () => {
    if (socket && callId) {
      socket.emit('end_call', {
        callId,
        workspaceId
      });
    }

    // Clean up peers
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    peersRef.current = {};
    setPeers({});
    setInCall(false);
    setCallId(null);
    setParticipants([]);
    setShowCallPopup(false);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Call Popup */}
      {showCallPopup && incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Incoming Video Call
            </h3>
            <p className="text-gray-600 mb-6">
              {incomingCall.fromUser?.name || 'Someone'} is calling...
            </p>
            <div className="flex gap-3">
              <button
                onClick={acceptCall}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={rejectCall}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className={`grid gap-4 ${Object.keys(peers).length === 0 ? 'grid-cols-1' : Object.keys(peers).length === 1 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {/* My Video */}
        <div className="relative">
          <video
            ref={myVideo}
            muted
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 bg-gray-100"
          />
          {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <button
                onClick={ensureLocalStream}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enable Camera/Mic
              </button>
              {lastMediaError && (
                <span className="text-xs text-red-600 bg-white/80 rounded px-2 py-1">
                  {lastMediaError}
                </span>
              )}
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            You {!isVideoEnabled && '(Video Off)'} {!isAudioEnabled && '(Muted)'}
          </div>
        </div>

        {/* Peer Videos */}
        {Object.entries(peers).map(([userId, peer]) => (
          <Video key={userId} peer={peer} userId={userId} />
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {!inCall ? (
          <button
            onClick={startCall}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            🎥 Start Video Call
          </button>
        ) : (
          <>
            <button
              onClick={toggleVideo}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isVideoEnabled
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isVideoEnabled ? '📹' : '📹❌'} Video
            </button>
            
            <button
              onClick={toggleAudio}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isAudioEnabled
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isAudioEnabled ? '🎤' : '🎤❌'} Audio
            </button>
            
            <button
              onClick={endCall}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              📞❌ End Call
            </button>
          </>
        )}
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        {inCall ? (
          <p className="text-green-600 font-medium">
            📞 In call with {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-gray-600">
            Ready for video calls. Click "Start Video Call" to begin.
          </p>
        )}
      </div>
    </div>
  );
}

function Video({ peer, userId }) {
  const ref = useRef();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    peer.on('stream', stream => {
      if (ref.current) {
        ref.current.srcObject = stream;
        setIsVideoLoaded(true);
      }
    });

    peer.on('error', err => {
      console.log('Peer error:', err);
    });

    return () => {
      if (ref.current) {
        ref.current.srcObject = null;
      }
    };
  }, [peer]);

  return (
    <div className="relative">
      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 bg-gray-100"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {userId?.slice(-6) || 'Participant'} {!isVideoLoaded && '(Connecting...)'}
      </div>
    </div>
  );
}


