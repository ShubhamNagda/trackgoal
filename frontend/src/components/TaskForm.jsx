import React, { useState, useEffect } from "react";

const emptyForm = { title: "", description: "", dueDate: "", priority: "medium" };

const TaskForm = ({ onSubmit, editingTask, onCancelEdit }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title,
        description: editingTask.description || "",
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingTask]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.dueDate) return;
    onSubmit(form);
    if (!editingTask) setForm(emptyForm);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <h3 className="font-semibold text-gray-700">
        {editingTask ? "Update task" : "Add a new task"}
      </h3>

      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        required
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
        rows={2}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition"
        >
          {editingTask ? "Save changes" : "Add task"}
        </button>
        {editingTask && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
