"use client";
import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { getSocket } from '../../../lib/socket';
import { getToken } from '../../../lib/auth';

export default function VideoPanel({ workspaceId }) {
  const [peers, setPeers] = useState([]);
  const myVideo = useRef(null);
  const token = getToken();
  const socket = getSocket(token);

  useEffect(() => {
    let stream;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
      stream = s;
      if (myVideo.current) myVideo.current.srcObject = s;
    });
    return () => { stream?.getTracks().forEach(t=>t.stop()); };
  }, []);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <video ref={myVideo} muted autoPlay playsInline className="rounded-lg border w-full" />
      {peers.map((p, idx)=> (
        <Video key={idx} peer={p} />
      ))}
      <div className="col-span-full">
        <p className="text-sm text-gray-600">Video calling scaffold ready. Signaling will be wired next.</p>
      </div>
    </div>
  );
}

function Video({ peer }) {
  const ref = useRef();
  useEffect(() => {
    peer.on('stream', stream => { if (ref.current) ref.current.srcObject = stream; });
  }, [peer]);
  return <video ref={ref} autoPlay playsInline className="rounded-lg border w-full" />
}


