"use client";
import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../../lib/socket';
import { getToken } from '../../../lib/auth';

export default function WhiteboardPanel({ workspaceId='demo-workspace' }) {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const undoneRef = useRef([]);
  const [color, setColor] = useState('#111827');
  const [size, setSize] = useState(2);
  const token = getToken();
  const socket = getSocket(token);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    let drawing = false;
    const start = (e) => { drawing = true; ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = size; ctx.moveTo(e.offsetX, e.offsetY); emit('begin', { x:e.offsetX, y:e.offsetY, color, size }); };
    const move = (e) => { if (!drawing) return; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); emit('draw', { x:e.offsetX, y:e.offsetY }); };
    const end = () => { if (!drawing) return; drawing = false; historyRef.current.push(ctx.getImageData(0,0,canvas.width,canvas.height)); undoneRef.current=[]; emit('end', {}); };
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
    }
  }, [color, size]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_workspaces', [workspaceId]);
    const onBegin = ({ x,y,color:c,size:s }) => { const ctx = canvasRef.current.getContext('2d'); ctx.beginPath(); ctx.strokeStyle=c; ctx.lineWidth=s; ctx.moveTo(x,y); };
    const onDraw = ({ x,y }) => { const ctx = canvasRef.current.getContext('2d'); ctx.lineTo(x,y); ctx.stroke(); };
    socket.on('wb_begin', onBegin);
    socket.on('wb_draw', onDraw);
    return ()=>{ socket.off('wb_begin', onBegin); socket.off('wb_draw', onDraw); };
  }, [socket, workspaceId]);

  const emit = (type, payload) => {
    if (!socket) return;
    const event = type==='begin' ? 'wb_begin' : type==='draw' ? 'wb_draw' : 'wb_end';
    socket.emit(event, { workspaceId, ...payload });
  };

  const undo = () => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    if (historyRef.current.length === 0) return;
    const last = historyRef.current.pop();
    undoneRef.current.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.putImageData(last, 0, 0);
  };
  const redo = () => {
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    if (undoneRef.current.length === 0) return;
    const img = undoneRef.current.pop();
    historyRef.current.push(ctx.getImageData(0,0,canvas.width,canvas.height));
    ctx.putImageData(img, 0, 0);
  };
  const clearCanvas = () => { const canvas=canvasRef.current; const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); historyRef.current=[]; undoneRef.current=[]; };

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-3 p-2 border-b">
        <label className="text-sm text-gray-900">Color</label>
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
        <label className="text-sm text-gray-900">Size</label>
        <input type="range" min={1} max={10} value={size} onChange={(e)=>setSize(parseInt(e.target.value))} />
        <button onClick={undo} className="rounded-md border px-2 py-1 text-sm">Undo</button>
        <button onClick={redo} className="rounded-md border px-2 py-1 text-sm">Redo</button>
        <button onClick={clearCanvas} className="rounded-md border px-2 py-1 text-sm">Clear</button>
      </div>
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-80" />
    </div>
  );
}


