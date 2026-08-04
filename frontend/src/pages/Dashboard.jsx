import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import TaskForm from "../components/TaskForm.jsx";
import TaskCard from "../components/TaskCard.jsx";
import Chatbot from "../components/Chatbot.jsx";

const toDateStr = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayStr = toDateStr(new Date());
const tomorrowStr = toDateStr(new Date(Date.now() + 86400000));

const TABS = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "all", label: "All tasks" },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === "today") params.date = todayStr;
      if (activeTab === "tomorrow") params.date = tomorrowStr;
      const res = await api.get("/tasks", { params });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get("/tasks/progress");
      setProgress(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress, tasks]);

  const handleAddOrUpdate = async (form) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, form);
        setEditingTask(null);
      } else {
        await api.post("/tasks", form);
      }
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save task");
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (id, email) => {
    try {
      const res = await api.post(`/tasks/${id}/share`, { email });
      setBanner(res.data.message);
      setTimeout(() => setBanner(""), 4000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to share task");
    }
  };

  const handleMovePending = async () => {
    try {
      const res = await api.post("/tasks/move-pending");
      setBanner(res.data.message);
      setTimeout(() => setBanner(""), 4000);
      fetchTasks();
      fetchProgress();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move pending tasks");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {banner && (
          <div className="bg-primary-50 border border-primary-200 text-primary-700 text-sm px-4 py-2 rounded-md mb-4">
            {banner}
          </div>
        )}

        {/* Progress overview */}
        {progress && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <ProgressBar
              label="Today"
              completed={progress.today.completed}
              total={progress.today.total}
              percent={progress.today.percent}
              color="bg-primary-600"
            />
            <ProgressBar
              label="Tomorrow"
              completed={progress.tomorrow.completed}
              total={progress.tomorrow.total}
              percent={progress.tomorrow.percent}
              color="bg-indigo-500"
            />
            <ProgressBar
              label="All tasks"
              completed={progress.all.completed}
              total={progress.all.total}
              percent={progress.all.percent}
              color="bg-emerald-500"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Task form */}
          <div className="md:w-1/3 space-y-4">
            <TaskForm
              onSubmit={handleAddOrUpdate}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
            />

            <button
              onClick={handleMovePending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md text-sm font-medium transition"
            >
              ⏩ Move yesterday's pending tasks to today
            </button>
          </div>

          {/* Right: Task list */}
          <div className="flex-1">
            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-md w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    activeTab === tab.key ? "bg-white shadow text-primary-700" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks here yet. Add one to get started!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={setEditingTask}
                    onDelete={handleDelete}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Dashboard;
