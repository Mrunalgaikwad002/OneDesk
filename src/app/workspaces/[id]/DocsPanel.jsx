"use client";
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { apiGet, apiPost } from '../../../lib/api';
import { getToken } from '../../../lib/auth';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function DocsPanel({ workspaceId }) {
  const [docId, setDocId] = useState("");
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState(null);
  const ydocRef = useRef(null);
  const ytextRef = useRef(null);
  const [editorValue, setEditorValue] = useState('');
  const [presence, setPresence] = useState([]); // array of {name}
  const token = getToken();

  useEffect(() => {
    return () => {
      if (provider) provider.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, [provider]);

  useEffect(() => {
    (async () => {
      if (workspaceId === 'demo-workspace') {
        setDocs([
          { id: 'demo-doc-1', title: 'Project Spec', updated_at: '2025-10-02T10:30:00Z' },
          { id: 'demo-doc-2', title: 'Meeting Notes', updated_at: '2025-10-01T15:45:00Z' },
          { id: 'demo-doc-3', title: 'API Design', updated_at: '2025-09-30T09:20:00Z' }
        ]);
        return;
      }
      try {
        const res = await apiGet(`/api/documents/workspace/${workspaceId}`, token);
        setDocs(res.documents || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      }
    })();
  }, [workspaceId, token]);

  const connect = (id) => {
    if (provider) provider.destroy();
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('quill');
    // y-websocket expects (serverUrl, roomName, ydoc, opts)
    const ws = new WebsocketProvider(
      'wss://onedesk-backend.onrender.com',
      'document-' + id,
      ydoc,
      { params: { documentId: id }, connect: true }
    );
    setProvider(ws);
    ydocRef.current = ydoc;
    ytextRef.current = ytext;
    setDocId(id);

    // initialize local presence name
    try {
      const raw = localStorage.getItem('tokenUser');
      const name = raw ? JSON.parse(raw)?.fullName || 'You' : 'You';
      ws.awareness.setLocalStateField('user', { name });
    } catch {
      ws.awareness.setLocalStateField('user', { name: 'You' });
    }

    // subscribe to presence updates
    const updatePresence = () => {
      const states = Array.from(ws.awareness.getStates().values());
      const list = states.map(s => ({ name: s?.user?.name || 'User' }));
      setPresence(list);
    };
    ws.awareness.on('change', updatePresence);
    updatePresence();

    // bind ytext to editor state
    setEditorValue(ytext.toString());
    const observer = () => setEditorValue(ytext.toString());
    ytext.observe(observer);
    ws.on('status', () => setEditorValue(ytext.toString()));
    // cleanup observer on provider destroy handled by effect cleanup
  };

  const createDoc = async () => {
    if (workspaceId === 'demo-workspace') {
      const newDoc = { id: `demo-doc-${Date.now()}`, title: title || 'Untitled', updated_at: new Date().toISOString() };
      setDocs([newDoc, ...docs]);
      setTitle("");
      connect(newDoc.id);
      return;
    }
    try {
      const res = await apiPost(`/api/documents/workspace/${workspaceId}`, { title: title || 'Untitled' }, token);
      setTitle("");
      const reload = await apiGet(`/api/documents/workspace/${workspaceId}`, token);
      setDocs(reload.documents || []);
      connect(res.document.id);
    } catch (err) {
      console.error('Failed to create document:', err);
      alert(`Failed to create document: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-3 bg-white">
          <div className="font-semibold text-gray-900">Documents</div>
          <div className="mt-2 space-y-2">
            {(docs.length ? docs : [
              { id: 'demo-doc-1', title: 'Getting started', updated_at: new Date().toISOString() },
              { id: 'demo-doc-2', title: 'Sprint notes', updated_at: new Date().toISOString() }
            ]).map(d => (
              <button key={d.id} onClick={()=>connect(d.id)} className={`w-full text-left rounded-md px-2 py-2 hover:bg-gray-50 ${docId===d.id?'bg-gray-50':''}`}>
                <div className="text-sm font-medium text-gray-900">{d.title}</div>
                <div className="text-xs text-gray-700">Updated {new Date(d.updatedAt || d.updated_at).toLocaleString()}</div>
              </button>
            ))}
            {docs.length===0 && <div className="text-xs text-gray-700">Showing demo documents. Create a real one below.</div>}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="New doc title" className="rounded-md border px-3 py-2 text-sm" />
            <button onClick={createDoc} className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-3 py-2 text-sm">Create</button>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-900">Connected to: {docId || '—'}</div>
            <div className="flex -space-x-2">
              {presence.map((p, idx)=> (
                <div key={idx} title={p.name} className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs border ring-2 ring-white">
                  {p.name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border">
            <ReactQuill theme="snow" value={editorValue} onChange={(val)=>{
              setEditorValue(val);
              if (ytextRef.current) {
                ytextRef.current.delete(0, ytextRef.current.length);
                ytextRef.current.insert(0, val);
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}


