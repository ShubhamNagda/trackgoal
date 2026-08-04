import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios.js";
import robotIcon from "../assets/ai.svg"

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your TrackGoal assistant. Ask me to help plan or prioritize your tasks." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: userMsg.text,
        history: newMessages.slice(-10),
      });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.response?.data?.message || "Something went wrong, try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="w-80 h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col mb-3 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500 text-white px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-sm">TrackGoal Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white text-lg leading-none">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm px-3 py-2 rounded-lg max-w-[85%] ${
                  m.role === "user"
                    ? "bg-primary-600 text-white ml-auto"
                    : "bg-white border border-gray-200 text-gray-700"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">Thinking...</div>}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={sendMessage} className="flex border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-4 text-sm hover:bg-primary-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
        
        <img src={robotIcon}
        alt="ai"
        onClick={() => setOpen((o) => !o) }
        title="Chat with TrackGoal Assistant"
        className=" cursor-pointer w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition"
        />
    </div>
  );
};

export default Chatbot;
