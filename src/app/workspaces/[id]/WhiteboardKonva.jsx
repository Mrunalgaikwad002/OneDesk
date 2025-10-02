"use client";
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports with error handling
const KonvaComponents = dynamic(
  () => import('react-konva').then(mod => ({
    Stage: mod.Stage,
    Layer: mod.Layer,
    Line: mod.Line
  })).catch(() => ({
    Stage: null,
    Layer: null,
    Line: null
  })),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border">Loading whiteboard...</div>
  }
);
import { getSocket } from '../../../lib/socket';
import { getToken } from '../../../lib/auth';

export default function WhiteboardKonva({ workspaceId='demo-workspace' }) {
  const [lines, setLines] = useState([]); // {points, color, size}
  const [current, setCurrent] = useState(null);
  const isDrawing = useRef(false);
  const token = getToken();
  const socket = getSocket(token);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_workspaces', [workspaceId]);
    const onLine = (payload) => setLines((prev)=>[...prev, payload]);
    socket.on('wb_line', onLine);
    return ()=> socket.off('wb_line', onLine);
  }, [socket, workspaceId]);

  const color = '#111827';
  const size = 3;

  const start = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setCurrent({ points: [pos.x, pos.y], color, size });
  };
  const move = (e) => {
    if (!isDrawing.current || !current) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrent((c)=> ({ ...c, points: [...c.points, pos.x, pos.y] }));
  };
  const end = () => {
    if (current) {
      setLines((prev)=>[...prev, current]);
      if (socket) socket.emit('wb_line', { workspaceId, ...current });
    }
    setCurrent(null);
    isDrawing.current = false;
  };

  // Fallback if Konva failed to load
  if (!KonvaComponents.Stage || !KonvaComponents.Layer || !KonvaComponents.Line) {
    return (
      <div className="rounded-lg border">
        <div className="h-80 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-600 mb-2">Whiteboard unavailable</div>
            <div className="text-sm text-gray-500">Konva library failed to load. Please refresh the page.</div>
          </div>
        </div>
      </div>
    );
  }

  const { Stage, Layer, Line } = KonvaComponents;

  return (
    <div className="rounded-lg border">
      <Stage 
        width={800} 
        height={400} 
        className="w-full h-80" 
        onMouseDown={start} 
        onMouseMove={move} 
        onMouseUp={end} 
        onTouchStart={start} 
        onTouchMove={move} 
        onTouchEnd={end}
      >
        <Layer>
          {lines.map((l, i)=> (
            <Line 
              key={i} 
              points={l.points} 
              stroke={l.color} 
              strokeWidth={l.size} 
              tension={0.5} 
              lineCap="round" 
              lineJoin="round" 
              globalCompositeOperation="source-over" 
            />
          ))}
          {current && (
            <Line 
              points={current.points} 
              stroke={current.color} 
              strokeWidth={current.size} 
              tension={0.5} 
              lineCap="round" 
              lineJoin="round" 
              globalCompositeOperation="source-over" 
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}


