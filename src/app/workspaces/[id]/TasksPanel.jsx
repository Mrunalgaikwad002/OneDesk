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
      alert('Failed to create board. Please try again.');
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
    <div className="space-y-4">
      {/* Board Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={selectedBoard?.id || ''}
            onChange={(e) => {
              const board = boards.find(b => b.id === e.target.value);
              setSelectedBoard(board);
            }}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {boards.map(board => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          + New Board
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-gray-50 border rounded-lg p-4">
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

      {/* Selected Board */}
      {selectedBoard && (
        <div className="bg-white border rounded-lg p-4">
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
  );
}


