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
      <form onSubmit={createTask} className="mb-3 flex items-center gap-2">
        <select value={target} onChange={(e)=>setTarget(e.target.value)} className="rounded-md border px-2 py-1 text-sm text-gray-900">
          <option value="todo">To‑Do</option>
          <option value="progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="New task title" className="rounded-md border px-3 py-2 text-sm flex-1 text-gray-900 placeholder-gray-400" />
        <button className="rounded-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-3 py-2 text-sm">+ Create Task</button>
      </form>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {[
            { key: 'todo', title: 'To‑Do' },
            { key: 'progress', title: 'In Progress' },
            { key: 'done', title: 'Done' }
          ].map(col => (
            <div key={col.key} className="min-w-64 w-64 rounded-lg border bg-white">
              <div className="p-3 font-semibold text-gray-900">{col.title}</div>
              <Droppable droppableId={col.key}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-2 min-h-10">
                    {lists[col.key].map((t, i) => (
                      <Draggable key={t.id} draggableId={t.id} index={i}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="rounded-md border p-2 text-sm bg-white">
                            <div className="font-medium text-gray-900">{t.title}</div>
                            <div className="mt-1 text-xs text-gray-700">Assignee: {t.assignee}</div>
                            <div className="text-xs text-gray-700">Due: {t.due}</div>
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


