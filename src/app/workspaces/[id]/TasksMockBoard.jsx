"use client";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initial = {
  todo: [
    { id: 'm-1', title: 'Design landing', assignee: 'Aditi', due: '2025-10-15' },
    { id: 'm-2', title: 'Draft spec', assignee: 'Rahul', due: '2025-10-18' },
  ],
  progress: [
    { id: 'm-3', title: 'Auth flow', assignee: 'Jack', due: '2025-10-20' }
  ],
  done: [
    { id: 'm-4', title: 'Repo setup', assignee: 'Sara', due: '2025-10-10' }
  ]
};

export default function TasksMockBoard() {
  const [lists, setLists] = useState(initial);
  const [newTitle, setNewTitle] = useState('');
  const [target, setTarget] = useState('todo');

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const start = source.droppableId; const finish = destination.droppableId;
    const current = { ...lists };
    const startItems = Array.from(current[start]);
    const [moved] = startItems.splice(source.index, 1);
    if (start === finish) {
      startItems.splice(destination.index, 0, moved);
      current[start] = startItems;
    } else {
      const finishItems = Array.from(current[finish]);
      finishItems.splice(destination.index, 0, moved);
      current[start] = startItems; current[finish] = finishItems;
    }
    setLists(current);
  };

  const createTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = 'm-' + Math.random().toString(36).slice(2, 8);
    setLists(prev => ({ ...prev, [target]: [...prev[target], { id, title: newTitle, assignee: 'You', due: new Date().toISOString().slice(0,10) }] }));
    setNewTitle('');
  };

  return (
    <div>
      <form onSubmit={createTask} className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-3">
          <select value={target} onChange={(e)=>setTarget(e.target.value)} className="input-modern px-3 py-2 text-sm font-medium">
            <option value="todo">📋 To‑Do</option>
            <option value="progress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>
          <input 
            value={newTitle} 
            onChange={(e)=>setNewTitle(e.target.value)} 
            placeholder="Enter new task title..." 
            className="input-modern flex-1 text-sm" 
          />
          <button className="btn-gradient-primary px-4 py-2 text-sm font-medium rounded-lg">
            + Create Task
          </button>
        </div>
      </form>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto custom-scrollbar">
          {[
            { key: 'todo', title: '📋 To‑Do', color: 'from-red-500 to-orange-500' },
            { key: 'progress', title: '⚡ In Progress', color: 'from-blue-500 to-purple-500' },
            { key: 'done', title: '✅ Done', color: 'from-green-500 to-teal-500' }
          ].map(col => (
            <div key={col.key} className="min-w-72 w-72 rounded-xl border bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className={`p-4 font-semibold text-white bg-gradient-to-r ${col.color} rounded-t-xl`}>
                {col.title}
              </div>
              <Droppable droppableId={col.key}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-2 min-h-10">
                    {lists[col.key].map((t, i) => (
                      <Draggable key={t.id} draggableId={t.id} index={i}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="card-modern p-4 text-sm bg-white hover:shadow-md transition-shadow cursor-grab">
                            <div className="font-medium text-gray-900 mb-2">{t.title}</div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center text-gray-600">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                {t.assignee}
                              </div>
                              <div className="text-gray-500">
                                📅 {t.due}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}


