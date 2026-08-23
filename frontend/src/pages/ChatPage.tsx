import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  History,
  Plus,
  ArrowLeft,
  Bot,
  Sparkles,
  HelpCircle,
  Send,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Building2,
  CheckCircle2
} from "lucide-react";
import { ChatMessage, ChatSession } from "../types";
import { sendChatMessage, deleteChatHistory, ChatApiError } from "../services/api";
import { Navbar } from "../components/Navbar";
import { MobileNav } from "../components/MobileNav";
import { DeleteChatModal } from "../components/DeleteChatModal";
import { AnimatedDotCard } from "../components/common/AnimatedDotCard";

const STORAGE_KEY = "gujarat_chat_sessions_v2";

export const ChatPage: React.FC = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Deletion Modal State
  const [deletingSession, setDeletingSession] = useState<ChatSession | null>(null);

  const welcomeMessage: ChatMessage = {
    id: "welcome-1",
    sender: "bot",
    text: "Welcome to the ACPC & Gujarat Admission Guidance Assistant. Ask about merit cutoffs, annual fees, hostelled campuses, or program placements across engineering, medical, commerce, and polytechnic universities.",
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved sessions on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        setSessions(parsed);
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.error("Error loading chat sessions:", e);
      setSessions([]);
    }
  }, []);

  // Save sessions to localStorage whenever state updates
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Error saving chat sessions:", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, hasError]);

  const handleSend = async (messageText?: string, isRetry: boolean = false) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const query = textToSend.trim();
    if (!messageText) setInputMessage("");
    setLastQuery(query);
    setHasError(false);
    setErrorMessage("");

    let currentSid = activeSessionId;

    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: "user",
        text: query,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      if (!currentSid) {
        currentSid = typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `session-${Date.now()}`;
        setActiveSessionId(currentSid);

        const title = query.length > 35 ? query.slice(0, 35) + "..." : query;
        const newSession: ChatSession = {
          sessionId: currentSid,
          title,
          messages: [userMsg],
          updatedAt: new Date().toISOString(),
        };

        saveSessions([newSession, ...sessions]);
      } else {
        const updated = sessions.map((s) => {
          if (s.sessionId === currentSid) {
            return {
              ...s,
              messages: [...s.messages, userMsg],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        });
        saveSessions(updated);
      }
    }

    setLoading(true);

    try {
      const responseData = await sendChatMessage(query, currentSid || undefined);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: responseData.response,
        intent: responseData.intent,
        college: responseData.college,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setHasError(false);

      // Update session with bot message
      setSessions((prevSessions) => {
        const updated = prevSessions.map((s) => {
          if (s.sessionId === currentSid) {
            return {
              ...s,
              detected_college: responseData.college || s.detected_college,
              messages: [...s.messages, botMsg],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        });
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setHasError(true);
      if (error instanceof ChatApiError) {
        console.error(`HTTP ${error.status} from /api/v1/chat/:`, error.detail);
        if (error.status === 422) {
          setErrorMessage(`Request validation failed (HTTP 422). The chat payload was rejected by the server. Detail: ${error.detail}`);
        } else {
          setErrorMessage(`Server returned HTTP ${error.status}: ${error.statusText}`);
        }
      } else if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("Failed"))) {
        setErrorMessage("FastAPI backend server is unresponsive on http://127.0.0.1:8000.");
      } else {
        setErrorMessage("An unexpected error occurred while sending your message.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSend(lastQuery, true);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.sessionId);
    setMessages([welcomeMessage, ...session.messages]);
    setHasError(false);
    setErrorMessage("");
  };

  const handleStartNewChat = () => {
    setActiveSessionId(null);
    setMessages([welcomeMessage]);
    setInputMessage("");
    setHasError(false);
    setErrorMessage("");
  };

  const handleDeleteSession = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSession(session);
  };

  const confirmDeleteSession = async () => {
    if (!deletingSession) return;

    const targetSid = deletingSession.sessionId;

    const updated = sessions.filter((s) => s.sessionId !== targetSid);
    saveSessions(updated);

    await deleteChatHistory(targetSid);

    if (activeSessionId === targetSid) {
      handleStartNewChat();
    }
    setDeletingSession(null);
  };

  const quickPrompts = [
    "Highest placement packages at PDEU?",
    "DAIICT Computer Science placement stats",
    "Top Medical colleges with MBBS in Rajkot",
    "Hostel facilities and fees at Nirma University",
    "Cutoff rank for Computer Engineering at LDCE",
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 h-screen overflow-hidden relative">
      {/* Outer Ambient Motion & Glow Layer */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-slate-900 rounded-full blur-3xl pointer-events-none -z-10" />

      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full p-4 sm:p-6 gap-6"
      >
        {/* Left Session History Sidebar Card */}
        <aside className="w-80 hidden lg:flex flex-col">
          <AnimatedDotCard className="p-4 flex-1">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Chat History</span>
              </h3>
              <button
                onClick={handleStartNewChat}
                className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {sessions.length === 0 ? (
                <div className="py-14 text-center text-slate-400">
                  <Bot className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">No chat history yet</p>
                  <p className="text-[11px] mt-0.5 text-slate-500">Start a new conversation below.</p>
                </div>
              ) : (
                sessions.map((session) => {
                  const isActive = activeSessionId === session.sessionId;
                  return (
                    <div
                      key={session.sessionId}
                      onClick={() => handleSelectSession(session)}
                      className={`w-full text-left py-2.5 px-3 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-2 ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 border-l-4 border-l-indigo-600 border-indigo-200 dark:border-indigo-800 shadow-xs"
                          : "bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold line-clamp-1 ${
                          isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                        }`}>
                          {session.title}
                        </p>
                        {session.detected_college && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium block mt-0.5 line-clamp-1 flex items-center gap-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            {session.detected_college}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(session, e)}
                        title="Delete conversation"
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-all text-xs shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </AnimatedDotCard>
        </aside>

        {/* Main Chat Conversation Panel Card */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatedDotCard topBorderAccent={true} className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="relative z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3.5 px-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Directory Index</span>
                </Link>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">Gujarat College Assistant AI</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Grounded RAG Pipeline • Hybrid Vector Retrieval</p>
                </div>
              </div>
              <span className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Active
              </span>
            </div>

            {/* Messages Stream */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium shadow-md shadow-indigo-600/20 rounded-tr-xs"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      msg.text
                    ) : (
                      <ReactMarkdown
                        components={{
                          h3: ({ node, ...props }) => (
                            <h3 className="font-extrabold text-base text-indigo-600 dark:text-indigo-400 my-2" {...props} />
                          ),
                          h4: ({ node, ...props }) => (
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white my-1" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-1.5 text-slate-800 dark:text-slate-200 font-normal leading-relaxed" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="my-2 space-y-1 pl-1" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="flex items-start gap-2 text-slate-800 dark:text-slate-200 font-normal" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-extrabold text-slate-900 dark:text-white" {...props} />
                          )
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Bot Source Badges */}
                  {msg.sender === "bot" && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 px-1 text-xs">
                      <span className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-md text-[10px] border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Verified ACPC Records
                      </span>
                      {msg.college && (
                        <span className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-md text-[10px] border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {msg.college}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 rounded-xl w-max text-xs text-slate-700 dark:text-slate-300 shadow-sm animate-pulse">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <span>Generating grounded RAG response...</span>
                </div>
              )}

              {/* Enhanced Interactive Error & Retry Banner */}
              {hasError && (
                <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-bold">Chat Request Failed</p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        {errorMessage || "An unexpected error occurred."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Query</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="relative z-10 px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Prompts:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(prompt)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>

            {/* Bottom Input Dock */}
            <div className="relative z-10 p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all px-1">
                <input
                  type="text"
                  placeholder="Ask about NIRF rank, fees under 2 Lakhs, cutoffs, hostels..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2.5 outline-none font-medium"
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={loading || !inputMessage.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </AnimatedDotCard>
        </main>
      </motion.div>

      {/* Delete Chat Session Confirmation Modal */}
      <DeleteChatModal
        isOpen={deletingSession !== null}
        queryText={deletingSession?.title || ""}
        onClose={() => setDeletingSession(null)}
        onConfirm={confirmDeleteSession}
      />

      <MobileNav />
    </div>
  );
};

export default ChatPage;
