"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TasksBoard({ boardId }) {
  const token = getToken();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskByList, setNewTaskByList] = useState({});

  const load = async () => {
    const res = await apiGet(`/api/tasks/boards/${boardId}`, token);
    setBoard(res.board);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [boardId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    try {
      if (destination.droppableId === source.droppableId) {
        const listId = source.droppableId;
        const list = board.lists.find(l => l.id === listId);
        const taskIds = Array.from(list.tasks.map(t=>t.id));
        const [moved] = taskIds.splice(source.index, 1);
        taskIds.splice(destination.index, 0, moved);
        await apiPut(`/api/tasks/lists/${listId}/reorder`, { taskIds }, token);
      } else {
        // cross-list move
        await apiPut(`/api/tasks/tasks/${draggableId}`, { listId: destination.droppableId, position: destination.index }, token);
      }
      await load();
    } catch {}
  };

  const createTask = async (listId) => {
    const title = (newTaskByList[listId] || "").trim();
    if (!title) return;
    try {
      await apiPost(`/api/tasks/lists/${listId}/tasks`, { title }, token);
      setNewTaskByList(prev => ({ ...prev, [listId]: "" }));
      await load();
    } catch (e) {
      console.error('Failed to create task', e);
      alert(`Failed to create task: ${e.message}`);
    }
  };

  if (loading) return <div className="text-gray-600">Loading board...</div>;
  if (!board) return <div className="text-gray-600">Board not found.</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto">
        {board.lists.map((list) => (
          <div key={list.id} className="min-w-64 w-64 rounded-lg border bg-white">
            <div className="p-3 font-semibold text-gray-900">{list.name}</div>
            <Droppable droppableId={list.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-2 min-h-10">
                  {list.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="rounded-md border p-2 text-sm bg-white">
                        <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description && <div className="text-gray-600">{task.description}</div>}
                          <div className="mt-1 text-xs text-gray-700 flex items-center gap-2">
                            {task.assignedTo?.full_name && (
                              <span className="inline-flex items-center gap-1"><span className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">{task.assignedTo.full_name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase()}</span>{task.assignedTo.full_name}</span>
                            )}
                            {task.dueDate && <span>Due: {new Date(task.dueDate || task.due_date).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <div className="pt-2 border-t mt-2">
                    <div className="flex items-center gap-2">
                      <input
                        value={newTaskByList[list.id] || ""}
                        onChange={(e)=>setNewTaskByList(prev=>({ ...prev, [list.id]: e.target.value }))}
                        placeholder="New task title"
                        className="w-full px-2 py-1 border rounded text-sm text-gray-900"
                      />
                      <button
                        onClick={() => createTask(list.id)}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}


