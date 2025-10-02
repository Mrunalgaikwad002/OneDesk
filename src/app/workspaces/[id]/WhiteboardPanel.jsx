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
  const [historyCount, setHistoryCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const token = getToken();
  const socket = getSocket(token);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    let drawing = false;
    
    // Save initial blank state if history is empty
    if (historyRef.current.length === 0) {
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    
    // Function to get scaled coordinates
    const getScaledCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };
    
    const start = (e) => { 
      drawing = true;
      // Save state before starting new stroke
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      // Clear redo stack when new action is performed
      undoneRef.current = [];
      // Update state counters
      setHistoryCount(historyRef.current.length);
      setRedoCount(0);
      
      const coords = getScaledCoords(e);
      ctx.beginPath(); 
      ctx.strokeStyle = color; 
      ctx.lineWidth = size; 
      ctx.moveTo(coords.x, coords.y); 
      emit('begin', { x: coords.x, y: coords.y, color, size }); 
    };
    
    const move = (e) => { 
      if (!drawing) return; 
      const coords = getScaledCoords(e);
      ctx.lineTo(coords.x, coords.y); 
      ctx.stroke(); 
      emit('draw', { x: coords.x, y: coords.y }); 
    };
    
    const end = () => { 
      if (!drawing) return; 
      drawing = false; 
      emit('end', {}); 
    };
    
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
    const canvas = canvasRef.current; 
    const ctx = canvas.getContext('2d');
    if (historyRef.current.length <= 1) return;
    
    // Save current state to redo stack
    undoneRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Get previous state
    const previousState = historyRef.current.pop();
    
    // Clear canvas and restore previous state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
    
    // Update state counters
    setHistoryCount(historyRef.current.length);
    setRedoCount(undoneRef.current.length);
  };
  
  const redo = () => {
    const canvas = canvasRef.current; 
    const ctx = canvas.getContext('2d');
    if (undoneRef.current.length === 0) return;
    
    // Save current state to history
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Get next state from redo stack
    const nextState = undoneRef.current.pop();
    
    // Clear canvas and restore next state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(nextState, 0, 0);
    
    // Update state counters
    setHistoryCount(historyRef.current.length);
    setRedoCount(undoneRef.current.length);
  };
  const clearCanvas = () => { 
    const canvas = canvasRef.current; 
    const ctx = canvas.getContext('2d'); 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)]; 
    undoneRef.current = []; 
    setHistoryCount(1);
    setRedoCount(0);
  };

  return (
    <div className="rounded-lg border bg-white w-full">
      <div className="flex items-center gap-3 p-3 border-b bg-gray-50">
        <label className="text-sm font-medium text-gray-900">Color</label>
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="w-8 h-8 rounded" />
        <label className="text-sm font-medium text-gray-900">Size</label>
        <input type="range" min={1} max={15} value={size} onChange={(e)=>setSize(parseInt(e.target.value))} className="w-20" />
        <span className="text-sm text-gray-600">{size}px</span>
        <button 
          onClick={undo} 
          disabled={historyCount <= 1}
          className={`rounded-md px-3 py-1 text-sm ${
            historyCount <= 1 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Undo ({historyCount > 1 ? historyCount - 1 : 0})
        </button>
        <button 
          onClick={redo} 
          disabled={redoCount === 0}
          className={`rounded-md px-3 py-1 text-sm ${
            redoCount === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          Redo ({redoCount})
        </button>
        <button onClick={clearCanvas} className="rounded-md bg-red-500 text-white px-3 py-1 text-sm hover:bg-red-600">Clear</button>
      </div>
      <div className="p-2">
        <canvas ref={canvasRef} width={2400} height={1000} className="w-full h-[700px] border-2 border-gray-300 rounded cursor-crosshair bg-white" />
      </div>
    </div>
  );
}


