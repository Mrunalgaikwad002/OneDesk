"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import TaskBoardReal from "./TaskBoardReal";
import TasksMockBoard from "./TasksMockBoard";
import { getToken } from "../../../lib/auth";

export default function TasksPanel({ workspaceId }) {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const token = getToken();

  useEffect(() => {
    (async () => {
      if (workspaceId === 'demo-workspace') {
        const demoBoard = {
          id: 'demo-board-1',
          name: 'Demo Board',
          description: 'A demo task board with sample data',
          createdAt: new Date().toISOString()
        };
        setBoards([demoBoard]);
        setSelectedBoard(demoBoard);
        setLoading(false);
        return;
      }
      
      try {
        const res = await apiGet(`/api/tasks/workspace/${workspaceId}/boards`, token);
        const boardList = res.boards || [];
        setBoards(boardList);
        if (boardList.length > 0) {
          setSelectedBoard(boardList[0]);
        }
      } catch (err) {
        console.error('Failed to load boards:', err);
        // If backend is unavailable or auth error, show demo boards
        if (err.message.includes('Failed to fetch') || 
            err.message.includes('NetworkError') ||
            err.message.includes('Access token required') ||
            err.message.includes('Request failed') ||
            err.message.includes('Network error')) {
          console.log('Backend unavailable or auth error, showing demo boards');
          const demoBoards = [
            {
              id: 'demo-board-1',
              name: 'Project Tasks',
              description: 'Main project task board',
              createdAt: new Date().toISOString(),
              lists: [
                { id: 'list-1', name: 'To Do', tasks: [] },
                { id: 'list-2', name: 'In Progress', tasks: [] },
                { id: 'list-3', name: 'Done', tasks: [] }
              ]
            }
          ];
          setBoards(demoBoards);
          setSelectedBoard(demoBoards[0]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId, token]);

  const createBoard = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const res = await apiPost(`/api/tasks/workspace/${workspaceId}/boards`, { 
        name: name.trim(), 
        description: description.trim() || undefined 
      }, token);
      
      const newBoard = res.board;
      setBoards([newBoard, ...boards]);
      setSelectedBoard(newBoard);
      setName("");
      setDescription("");
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create board:', err);
      // If backend is unavailable or auth error, create a local demo board
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('NetworkError') ||
          err.message.includes('Access token required') ||
          err.message.includes('Request failed') ||
          err.message.includes('Network error')) {
        console.log('Backend unavailable or auth error, creating local demo board');
        const newBoard = {
          id: `demo-board-${Date.now()}`,
          name: name.trim(),
          description: description.trim() || 'Demo board',
          createdAt: new Date().toISOString(),
          lists: [
            { id: `list-${Date.now()}-1`, name: 'To Do', tasks: [] },
            { id: `list-${Date.now()}-2`, name: 'In Progress', tasks: [] },
            { id: `list-${Date.now()}-3`, name: 'Done', tasks: [] }
          ]
        };
        setBoards([newBoard, ...boards]);
        setSelectedBoard(newBoard);
        setName("");
        setDescription("");
        setShowCreateForm(false);
      } else {
        alert(`Failed to create board: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading boards...</div>
      </div>
    );
  }

  // No boards - show create form or demo
  if (boards.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Task Boards Yet</h3>
          <p className="text-gray-600 mb-4">Create your first task board to get started with project management.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            + Create Board
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Create New Board</h4>
            <form onSubmit={createBoard} className="space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Board name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Board description (optional)"
                rows={2}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create Board
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {workspaceId === 'demo-workspace' && (
          <div className="mt-8">
            <div className="text-center mb-4">
              <p className="text-gray-600">Or explore with our demo board:</p>
            </div>
            <TasksMockBoard />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Selector */}
      <div className="flex items-center justify-between p-6 bg-white border-b">
        <div className="flex items-center gap-4">
          <select
            value={selectedBoard?.id || ''}
            onChange={(e) => {
              const board = boards.find(b => b.id === e.target.value);
              setSelectedBoard(board);
            }}
            className="input-modern px-4 py-2 font-medium"
          >
            {boards.map(board => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
          <span className="text-sm px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium">
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-gradient-primary px-6 py-2 rounded-lg font-medium"
        >
          + New Board
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <h4 className="font-semibold text-gray-900 mb-4 text-lg">Create New Board</h4>
          <form onSubmit={createBoard} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Board name"
              className="input-modern w-full"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Board description (optional)"
              rows={3}
              className="input-modern w-full resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="btn-gradient-primary px-6 py-2 rounded-lg font-medium"
              >
                Create Board
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Board */}
      <div className="flex-1 overflow-hidden">
        {selectedBoard && (
          <div className="h-full">
            {selectedBoard.id === 'demo-board-1' ? (
              <TasksMockBoard />
            ) : (
              <TaskBoardReal 
                workspaceId={workspaceId} 
                boardId={selectedBoard.id} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}


