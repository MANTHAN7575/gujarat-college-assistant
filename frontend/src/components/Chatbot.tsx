import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../types";
import { sendChatMessage } from "../services/api";

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: "👋 Hello! I am your Gujarat AI College Assistant. Ask me anything about engineering & management colleges, fees, hostels, cutoffs, or placement packages!",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch session_id
  useEffect(() => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}`;
      localStorage.setItem("chat_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInputMessage("");
    setLoading(true);

    try {
      const responseData = await sendChatMessage(userMsg.text, sessionId);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseData.response,
        intent: responseData.intent,
        college: responseData.college,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          text: "⚠️ Sorry, I couldn't get the information right now. Please try asking again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Highest placement packages at PDEU?",
    "Hostel facilities at DA-IICT?",
    "Computer Engineering fees at Nirma?",
    "Suggest best colleges for 75% marks",
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-2xl z-50 transition-all duration-300 hover:scale-105"
        aria-label="Toggle Chat"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* Chat Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[92vw] h-[540px] max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 z-50 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                🎓
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">Gujarat AI Assistant</h3>
                <p className="text-xs text-blue-200">Your AI Admission Guide</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-xl font-bold px-2"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Metadata Badges for Bot Messages */}
                {msg.sender === "bot" && (msg.college || msg.intent) && (
                  <div className="flex items-center gap-2 mt-1 px-1">
                    {msg.college && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                        🏫 {msg.college}
                      </span>
                    )}
                    {msg.intent && msg.intent !== "general" && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded-full capitalize">
                        🏷️ {msg.intent}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs bg-white px-3 py-2 rounded-xl border border-gray-100 w-max shadow-sm">
                <span className="animate-spin">⏳</span> Finding college information...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length < 3 && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 font-medium px-2.5 py-1 rounded-lg transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about fees, cutoffs, hostels..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-gray-100 text-gray-900 text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};
export default Chatbot;
