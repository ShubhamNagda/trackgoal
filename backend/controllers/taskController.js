import Task from "../models/Task.js";
import User from "../models/User.js";
import { sendTaskShareEmail } from "../utils/sendEmail.js";

// helper: yyyy-mm-dd for a Date object (local)
const toDateStr = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayStr = () => toDateStr(new Date());
const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateStr(d);
};
const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
};

// @desc   Create task
// @route  POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ message: "Title and due date are required" });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      dueDate,
      priority: priority || "medium",
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Get all tasks for logged in user (optionally filter by ?date=)
// @route  GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.date) filter.dueDate = req.query.date;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Update a task (edit fields or toggle complete)
// @route  PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const fields = ["title", "description", "dueDate", "completed", "priority"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Delete a task
// @route  DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Move all yesterday's uncompleted tasks to today
// @route  POST /api/tasks/move-pending
export const movePendingTasks = async (req, res) => {
  try {
    const yesterday = getYesterdayStr();
    const today = getTodayStr();

    const result = await Task.updateMany(
      { user: req.user._id, dueDate: yesterday, completed: false },
      { $set: { dueDate: today } }
    );

    const tasks = await Task.find({ user: req.user._id, dueDate: today }).sort({ createdAt: -1 });

    res.json({
      message: `Moved ${result.modifiedCount} task(s) from yesterday to today`,
      movedCount: result.modifiedCount,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Progress summary for today / tomorrow / all tasks
// @route  GET /api/tasks/progress
export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();

    const buildStats = async (filter) => {
      const total = await Task.countDocuments({ user: userId, ...filter });
      const completed = await Task.countDocuments({ user: userId, ...filter, completed: true });
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      return { total, completed, percent };
    };

    const [todayStats, tomorrowStats, allStats] = await Promise.all([
      buildStats({ dueDate: today }),
      buildStats({ dueDate: tomorrow }),
      buildStats({}),
    ]);

    res.json({ today: todayStats, tomorrow: tomorrowStats, all: allStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc   Share a task with another user by email
// @route  POST /api/tasks/:id/share
export const shareTask = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Recipient email is required" });

    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const recipient = await User.findOne({ email: email.toLowerCase() });

    // Always email the recipient a notification
    await sendTaskShareEmail(email, req.user.name, task.title);

    // If the recipient already has a TrackGoal account, copy the task into their list too
    if (recipient) {
      await Task.create({
        user: recipient._id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        sharedBy: req.user.email,
      });
    }

    res.json({
      message: recipient
        ? "Task shared and added to their TrackGoal list"
        : "Task shared via email (recipient does not have a TrackGoal account yet)",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
