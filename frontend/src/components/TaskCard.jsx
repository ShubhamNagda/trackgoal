import React, { useState } from "react";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, onShare }) => {
  const [shareEmail, setShareEmail] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!shareEmail) return;
    setSharing(true);
    await onShare(task._id, shareEmail);
    setSharing(false);
    setShareEmail("");
    setShowShare(false);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 flex flex-col gap-2 border-l-4 ${
        task.completed ? "border-green-500 opacity-70" : "border-primary-500"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
            className="mt-1.5 w-4 h-4 accent-primary-600 cursor-pointer"
          />
          <div>
            <h4 className={`font-medium text-gray-800 ${task.completed ? "line-through" : ""}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
            )}
            {task.sharedBy && (
              <p className="text-xs text-primary-600 mt-1">Shared by {task.sharedBy}</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
        <span>Due: {task.dueDate}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={() => onEdit(task)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task._id)}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md transition"
        >
          Delete
        </button>
        <button
          onClick={() => setShowShare((s) => !s)}
          className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-600 px-3 py-1 rounded-md transition"
        >
          Share
        </button>
      </div>

      {showShare && (
        <div className="flex gap-2 mt-2">
          <input
            type="email"
            placeholder="friend@example.com"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleShare}
            disabled={sharing}
            className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md transition disabled:opacity-50"
          >
            {sharing ? "Sending..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
