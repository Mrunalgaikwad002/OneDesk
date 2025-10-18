"use client";

import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

let socket = null; // socket.io-client instance

export default function RoomPage() {
  const { id: roomId } = useParams();

  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // map socketId -> RTCPeerConnection
  const localStreamRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ id, stream }]
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  useEffect(() => {
    if (!roomId) return;
    let isMounted = true;

    async function getLocalStream() {
      try {
        // Request directly to trigger browser permission prompt
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.error('Error accessing media devices', err);
        alert('Could not access camera/microphone — check permissions');
        return null;
      }
    }

    (async () => {
      const { io } = await import('socket.io-client');
      const url = process.env.NEXT_PUBLIC_SOCKET_URL || undefined; // default to same-origin
      socket = io(url);

      const stream = await getLocalStream();
      if (!stream) return;

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }

      socket.emit('join-room', roomId);

      socket.on('all-users', users => {
        if (!isMounted) return;
        users.forEach(createOffer);
      });

      socket.on('user-joined', createOffer);

      socket.on('offer', async ({ sdp, caller }) => {
        if (!isMounted) return;
        const pc = createPeerConnection(caller);
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: caller, sdp: pc.localDescription });
      });

      socket.on('answer', async ({ sdp, caller }) => {
        if (!isMounted) return;
        const pc = peersRef.current[caller];
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      socket.on('ice-candidate', async ({ candidate, from }) => {
        if (!isMounted) return;
        const pc = peersRef.current[from];
        if (!pc) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate', err);
        }
      });

      socket.on('user-left', cleanupPeer);
    })();

    return () => {
      isMounted = false;
      cleanupAll();
    };
  }, [roomId]);

  function createPeerConnection(peerId) {
    if (peersRef.current[peerId]) return peersRef.current[peerId];

    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    }

    pc.ontrack = event => {
      const [stream] = event.streams;
      setRemoteStreams(prev => {
        if (prev.find(s => s.id === peerId)) return prev;
        return [...prev, { id: peerId, stream }];
      });
    };

    pc.onicecandidate = event => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { target: peerId, candidate: event.candidate });
      }
    };

    peersRef.current[peerId] = pc;
    return pc;
  }

  async function createOffer(peerId) {
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { target: peerId, sdp: pc.localDescription });
  }

  function cleanupPeer(peerId) {
    const pc = peersRef.current[peerId];
    if (pc) {
      try { pc.close(); } catch (e) {}
      delete peersRef.current[peerId];
    }
    setRemoteStreams(prev => prev.filter(s => s.id !== peerId));
  }

  function cleanupAll() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    Object.keys(peersRef.current).forEach(cleanupPeer);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  }

  function toggleMic() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !micEnabled);
    setMicEnabled(prev => !prev);
  }

  function toggleCam() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !camEnabled);
    setCamEnabled(prev => !prev);
  }

  // Allow retrying permission on user gesture if initial attempt was blocked
  async function requestAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Permission request failed', err);
      alert('Permission denied or no devices found. Check browser site settings.');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Room: {roomId}</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={toggleMic}>{micEnabled ? 'Mute Mic' : 'Unmute Mic'}</button>
        <button onClick={toggleCam} style={{ marginLeft: 8 }}>
          {camEnabled ? 'Turn Camera Off' : 'Turn Camera On'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 12,
        }}
      >
        <div style={{ border: '1px solid #ccc', padding: 8 }}>
          <h4>You (local)</h4>
          <video ref={localVideoRef} autoPlay playsInline style={{ width: '100%' }} />
          {!localStreamRef.current && (
            <div style={{ marginTop: 8 }}>
              <button onClick={requestAccess}>Request Camera/Mic</button>
            </div>
          )}
        </div>

        {remoteStreams.map(r => (
          <div key={r.id} style={{ border: '1px solid #ccc', padding: 8 }}>
            <h4>Peer: {r.id}</h4>
            <video
              autoPlay
              playsInline
              ref={el => { if (el && r.stream) el.srcObject = r.stream; }}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


