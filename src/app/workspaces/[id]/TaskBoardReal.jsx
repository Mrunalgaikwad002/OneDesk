"use client";
import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getSocket } from '../../../lib/socket';
import { getToken } from '../../../lib/auth';
import { apiGet, apiPost, apiPut } from '../../../lib/api';

export default function TaskBoardReal({ workspaceId, boardId }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeListId, setActiveListId] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  
  const token = getToken();
  const socket = getSocket(token);

  // Load board data
  const loadBoard = useCallback(async () => {
    if (!boardId || !token) return;
    
    try {
      setLoading(true);
      const res = await apiGet(`/api/tasks/boards/${boardId}`, token);
      setBoard(res.board);
    } catch (err) {
      console.error('Failed to load board:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [boardId, token]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Socket.io real-time events
  useEffect(() => {
    if (!socket || !boardId) return;

    // Join the board room
    socket.emit('join_task_board', { boardId });

    // Listen for real-time updates
    const onTaskCreated = ({ listId, task }) => {
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(list => 
            list.id === listId 
              ? { ...list, tasks: [...list.tasks, task] }
              : list
          )
        };
      });
    };

    const onTaskUpdated = ({ taskId, updates }) => {
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(list => ({
            ...list,
            tasks: list.tasks.map(task => 
              task.id === taskId 
                ? { ...task, ...updates }
                : task
            )
          }))
        };
      });
    };

    const onTaskMoved = ({ taskId, sourceListId, destinationListId, sourceIndex, destinationIndex }) => {
      setBoard(prev => {
        if (!prev) return prev;
        
        const newLists = [...prev.lists];
        const sourceList = newLists.find(list => list.id === sourceListId);
        const destList = newLists.find(list => list.id === destinationListId);
        
        if (!sourceList || !destList) return prev;
        
        // Remove task from source
        const [movedTask] = sourceList.tasks.splice(sourceIndex, 1);
        
        // Add task to destination
        destList.tasks.splice(destinationIndex, 0, movedTask);
        
        return { ...prev, lists: newLists };
      });
    };

    const onTaskDeleted = ({ taskId, listId }) => {
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists.map(list => 
            list.id === listId 
              ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
              : list
          )
        };
      });
    };

    const onListCreated = ({ list }) => {
      setBoard(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: [...prev.lists, { ...list, tasks: [] }]
        };
      });
    };

    socket.on('task_created', onTaskCreated);
    socket.on('task_updated', onTaskUpdated);
    socket.on('task_moved', onTaskMoved);
    socket.on('task_deleted', onTaskDeleted);
    socket.on('list_created', onListCreated);

    return () => {
      socket.off('task_created', onTaskCreated);
      socket.off('task_updated', onTaskUpdated);
      socket.off('task_moved', onTaskMoved);
      socket.off('task_deleted', onTaskDeleted);
      socket.off('list_created', onListCreated);
      socket.emit('leave_task_board', boardId);
    };
  }, [socket, boardId]);

  // Handle drag and drop
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Same position, no change
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Update local state immediately for smooth UI
    const newLists = [...board.lists];
    const sourceList = newLists.find(list => list.id === source.droppableId);
    const destList = newLists.find(list => list.id === destination.droppableId);

    if (!sourceList || !destList) return;

    // Remove task from source
    const [movedTask] = sourceList.tasks.splice(source.index, 1);
    
    // Add task to destination
    destList.tasks.splice(destination.index, 0, movedTask);

    // Update board state
    setBoard(prev => ({ ...prev, lists: newLists }));

    // Emit real-time update
    socket.emit('task_moved', {
      boardId,
      taskId: draggableId,
      sourceListId: source.droppableId,
      destinationListId: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index
    });

    // Update task in database if moved to different list
    if (source.droppableId !== destination.droppableId) {
      try {
        await apiPut(`/api/tasks/tasks/${draggableId}`, {
          listId: destination.droppableId,
          position: destination.index
        }, token);
      } catch (err) {
        console.error('Failed to update task position:', err);
        // Revert local state on error
        loadBoard();
      }
    } else {
      // Just reorder within same list
      try {
        const reorderedTaskIds = destList.tasks.map(task => task.id);
        await apiPut(`/api/tasks/lists/${destination.droppableId}/reorder`, {
          taskIds: reorderedTaskIds
        }, token);
      } catch (err) {
        console.error('Failed to reorder tasks:', err);
        loadBoard();
      }
    }
  };

  // Create new task
  const createTask = async (listId) => {
    if (!newTaskTitle.trim()) return;

    try {
      const res = await apiPost(`/api/tasks/lists/${listId}/tasks`, {
        title: newTaskTitle.trim()
      }, token);

      // Emit real-time update
      socket.emit('task_created', {
        boardId,
        listId,
        task: res.task
      });

      setNewTaskTitle('');
      setActiveListId(null);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Create new list
  const createList = async () => {
    if (!newListName.trim()) return;

    try {
      const res = await apiPost(`/api/tasks/boards/${boardId}/lists`, {
        name: newListName.trim()
      }, token);

      // Emit real-time update
      socket.emit('list_created', {
        boardId,
        list: res.list
      });

      setNewListName('');
      setShowNewList(false);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId, completed) => {
    try {
      const updates = { completed: !completed };
      
      await apiPut(`/api/tasks/tasks/${taskId}`, updates, token);

      // Emit real-time update
      socket.emit('task_updated', {
        boardId,
        taskId,
        updates
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Board not found</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{board.name}</h2>
        {board.description && (
          <p className="text-sm text-gray-600 mt-1">{board.description}</p>
        )}
      </div>

      {/* Task Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {board.lists.map((list) => (
            <div key={list.id} className="min-w-72 w-72 bg-gray-50 rounded-lg p-3">
              {/* List Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{list.name}</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  {list.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <Droppable droppableId={list.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-24 space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                  >
                    {list.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-3 rounded-md border shadow-sm hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            } ${task.completed ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id, task.completed)}
                                className="mt-1 rounded"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium text-gray-900 ${
                                  task.completed ? 'line-through' : ''
                                }`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {task.assignedTo && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs">
                                        {task.assignedTo.full_name?.charAt(0) || 'U'}
                                      </div>
                                      <span className="text-xs text-gray-600">
                                        {task.assignedTo.full_name || task.assignedTo.email}
                                      </span>
                                    </div>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500">
                                      Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
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

              {/* Add Task */}
              {activeListId === list.id ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') createTask(list.id);
                      if (e.key === 'Escape') setActiveListId(null);
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => createTask(list.id)}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => setActiveListId(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setActiveListId(list.id)}
                  className="w-full mt-3 p-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-2"
                >
                  <span>+</span> Add a task
                </button>
              )}
            </div>
          ))}

          {/* Add List */}
          {showNewList ? (
            <div className="min-w-72 w-72 bg-gray-50 rounded-lg p-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') createList();
                  if (e.key === 'Escape') setShowNewList(false);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={createList}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  Add List
                </button>
                <button
                  onClick={() => setShowNewList(false)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewList(true)}
              className="min-w-72 w-72 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-sm transition-colors"
            >
              <span>+</span> Add another list
            </button>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
