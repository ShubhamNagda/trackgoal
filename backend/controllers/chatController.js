import fetch from "node-fetch";
import Task from "../models/Task.js";

// @desc   Chat with Gemini about your tasks / productivity
// @route  POST /api/chat
export const chatWithGemini = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured on the server" });
    }

    // Give the bot a little context about the user's current tasks
    const today = new Date().toISOString().slice(0, 10);
    const todaysTasks = await Task.find({ user: req.user._id, dueDate: today }).select(
      "title completed priority"
    );

    const taskSummary = todaysTasks.length
      ? todaysTasks
          .map((t) => `- ${t.title} [${t.completed ? "done" : "pending"}, ${t.priority}]`)
          .join("\n")
      : "No tasks scheduled for today.";

    const systemContext = `You are the TrackGoal assistant, a friendly productivity coach embedded in a task-tracking app.
Help the user plan, prioritize, and stay motivated about their tasks. Keep replies short and practical.
Here are the user's tasks for today:
${taskSummary}`;

    const contents = [
      { role: "user", parts: [{ text: systemContext }] },
      { role: "model", parts: [{ text: "Got it, I can see today's tasks. How can I help?" }] },
      ...(Array.isArray(history)
        ? history.map((h) => ({
            role: h.role === "assistant" ? "model" : "user",
            parts: [{ text: h.text }],
          }))
        : []),
      { role: "user", parts: [{ text: message }] },
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: data?.error?.message || "Gemini API error" });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "Sorry, I couldn't generate a reply right now.";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
