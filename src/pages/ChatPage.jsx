import { useState, useRef, useEffect, useCallback } from "react";
import CustomCursor from "../components/CustomCursor";
import { getToken } from "../utils/auth";
import "../styles/ChatPage.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MOODS = [
  { label: "Calm", emoji: "😌" },
  { label: "Anxious", emoji: "😰" },
  { label: "Low", emoji: "😔" },
  { label: "Stressed", emoji: "🤯" },
  { label: "Hopeful", emoji: "✨" },
  { label: "Grateful", emoji: "🌸" },
];

const WELCOME_MSG = {
  id: "__welcome__",
  from: "bot",
  text: "Good morning. How are you feeling today? I'm here and fully listening. 🧡",
  time: new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  }),
};

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fmt = (d) =>
  new Date(d).toLocaleDateString([], { month: "short", day: "numeric" });

const getSessionId = (session) => session?._id || session?.id || null;

const normalizeSession = (session) => ({
  ...session,
  _id: getSessionId(session),
  startMood: session?.startMood ?? session?.start_mood ?? null,
  createdAt: session?.createdAt ?? session?.created_at,
  updatedAt: session?.updatedAt ?? session?.updated_at,
});

const normalizeMessage = (message) => ({
  id: message?._id || message?.id || Date.now() + Math.random(),
  from: message?.role === "user" ? "user" : "bot",
  text: message?.content || "",
  time: new Date(
    message?.createdAt || message?.created_at || Date.now(),
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
});

// ─── Mood Picker Modal ─────────────────────────────────────────────────────
function MoodModal({ title, subtitle, onSelect, onSkip }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card mood-modal">
        <div className="modal-emoji">🌿</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-sub">{subtitle}</p>
        <div className="mood-grid">
          {MOODS.map((m) => (
            <button
              key={m.label}
              className="mood-grid-btn"
              onClick={() => onSelect(m.label)}
            >
              <span className="mood-grid-emoji">{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
        {onSkip && (
          <button className="modal-skip" onClick={onSkip}>
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}

// ─── End Session Feedback Modal ────────────────────────────────────────────
function FeedbackModal({ onSubmit, onSkip }) {
  const [endMood, setEndMood] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [step, setStep] = useState("mood");

  const handleMoodSelect = (m) => {
    setEndMood(m);
    setStep("rating");
  };

  const handleSubmit = () =>
    onSubmit({
      endMood,
      rating: rating || null,
      feedback: feedback.trim() || null,
    });

  if (step === "mood") {
    return (
      <div className="modal-overlay">
        <div className="modal-card mood-modal">
          <div className="modal-emoji">💬</div>
          <h2 className="modal-title">How are you feeling now?</h2>
          <p className="modal-sub">After our conversation today</p>
          <div className="mood-grid">
            {MOODS.map((m) => (
              <button
                key={m.label}
                className="mood-grid-btn"
                onClick={() => handleMoodSelect(m.label)}
              >
                <span className="mood-grid-emoji">{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
          <button className="modal-skip" onClick={onSkip}>
            Skip feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card feedback-modal">
        <div className="modal-emoji">
          {MOODS.find((m) => m.label === endMood)?.emoji || "🧡"}
        </div>
        <h2 className="modal-title">How was this session?</h2>
        <p className="modal-sub">Your feedback helps Sukhi grow 🌱</p>
        <div className="star-row">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`star-btn ${rating >= n ? "lit" : ""}`}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          className="feedback-textarea"
          placeholder="Anything you'd like to share? (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
        <div className="feedback-actions">
          <button className="modal-skip" onClick={onSkip}>
            Skip
          </button>
          <button className="feedback-submit-btn" onClick={handleSubmit}>
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onClose,
  onDelete,
  loading,
}) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <span className="sidebar-logo">
          Su<em>khi</em>
        </span>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          title="Close sidebar"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <button className="sidebar-new-btn" onClick={onNew}>
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        New Session
      </button>

      <div className="session-list">
        {loading && <p className="session-empty">Loading…</p>}
        {!loading && sessions.length === 0 && (
          <p className="session-empty">No sessions yet</p>
        )}
        {sessions.map((s) => {
          const sid = getSessionId(s);
          if (!sid) return null;

          return (
            <div
              key={sid}
              className={`session-item ${sid === activeId ? "active" : ""} ${s.ended ? "ended" : ""}`}
              onMouseEnter={() => setHoveredId(sid)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelect(sid)}
            >
              <span className="session-item-icon">{s.ended ? "✅" : "💬"}</span>
              <span className="session-item-body">
                <span className="session-item-title">
                  {s.title || "New Conversation"}
                </span>
                <span className="session-item-date">
                  {s.startMood
                    ? `${MOODS.find((m) => m.label === s.startMood)?.emoji || ""} ${s.startMood} · `
                    : ""}
                  {fmt(s.updatedAt || s.createdAt)}
                </span>
              </span>
              {hoveredId === sid && (
                <button
                  className="session-delete-btn"
                  title="Delete session"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(sid);
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

// ─── Chat Panel ─────────────────────────────────────────────────────────────
function ChatPanel({
  sessionId: initialSessionId,
  sidebarOpen,
  onToggleSidebar,
  onSessionCreated,
  onSessionEnded,
}) {
  const [resolvedSessionId, setResolvedSessionId] = useState(initialSessionId);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(!!initialSessionId);
  const [isEnded, setIsEnded] = useState(false);

  // Mood modal
  const [showStartMood, setShowStartMood] = useState(!initialSessionId);
  const [startMood, setStartMood] = useState(null);

  // Feedback modal
  const [showFeedback, setShowFeedback] = useState(false);

  // Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // Load history for existing session
  useEffect(() => {
    if (!initialSessionId) {
      setLoadingHistory(false);
      return;
    }
    setResolvedSessionId(initialSessionId);
    setMessages([WELCOME_MSG]);
    setLoadingHistory(true);
    setShowStartMood(false);
    setSuggestions([]);

    (async () => {
      try {
        const res = await fetch(
          `${API}/api/chat/sessions/${initialSessionId}/messages`,
          {
            credentials: "include",
            headers: authHeaders(),
          },
        );
        const data = await res.json();
        if (data.success && data.messages.length > 0) {
          setMessages(data.messages.map(normalizeMessage));
        }
      } catch (_) {
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [initialSessionId]);

  // Scroll the messages container directly — never touches document scroll
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, suggestions]);

  // Fetch AI suggestions
  const fetchSuggestions = useCallback(async (history) => {
    if (history.filter((m) => m.id !== "__welcome__").length < 2) return;
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const res = await fetch(`${API}/api/chat/suggestions`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== "__welcome__")
            .map((m) => ({
              role: m.from === "user" ? "user" : "assistant",
              content: m.text,
            })),
        }),
      });
      const data = await res.json();
      if (data.success) setSuggestions(data.suggestions || []);
    } catch (_) {
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || isTyping || isEnded) return;

    setSuggestions([]);
    const userMsg = {
      id: Date.now(),
      from: "user",
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const prevMessages = messages.filter((m) => m.id !== "__welcome__");
    const history = [...prevMessages, userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      let sid = resolvedSessionId;
      if (!sid) {
        const cr = await fetch(`${API}/api/chat/sessions`, {
          method: "POST",
          credentials: "include",
          headers: authHeaders(),
          body: JSON.stringify({ startMood }),
        });
        const cd = await cr.json();
        if (!cd.success) throw new Error("Failed to create session");
        sid = getSessionId(cd.session);
        if (!sid) throw new Error("Session id missing from API response");
        setResolvedSessionId(sid);
        onSessionCreated(normalizeSession(cd.session));
      }

      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({
          sessionId: sid,
          messages: history.map((m) => ({
            role: m.from === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });
      if (!res.ok) throw new Error("Chat request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      const t = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const botMsgs = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop();
        for (const sentence of parts) {
          const s = sentence.trim();
          if (s) {
            const msg = {
              id: Date.now() + Math.random(),
              from: "bot",
              text: s,
              time: t,
            };
            botMsgs.push(msg);
            setMessages((p) => [...p, msg]);
          }
        }
      }
      if (buf.trim()) {
        const t2 = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const msg = {
          id: Date.now() + Math.random(),
          from: "bot",
          text: buf.trim(),
          time: t2,
        };
        botMsgs.push(msg);
        setMessages((p) => [...p, msg]);
      }

      fetchSuggestions([...history, ...botMsgs]);
    } catch {
      const t3 = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((p) => [
        ...p,
        {
          id: Date.now() + Math.random(),
          from: "bot",
          text: "Sorry, something went wrong. Please try again.",
          time: t3,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndClick = () => {
    if (
      !resolvedSessionId &&
      messages.filter((m) => m.id !== "__welcome__").length === 0
    ) {
      onSessionEnded(null, null);
      return;
    }
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async ({ endMood, rating, feedback }) => {
    setShowFeedback(false);
    setIsEnded(true);
    if (resolvedSessionId) {
      try {
        await fetch(`${API}/api/chat/sessions/${resolvedSessionId}/end`, {
          method: "POST",
          credentials: "include",
          headers: authHeaders(),
          body: JSON.stringify({ endMood, rating, feedback }),
        });
      } catch (_) {}
    }
    onSessionEnded(resolvedSessionId, { endMood, rating });
  };

  const handleFeedbackSkip = async () => {
    setShowFeedback(false);
    setIsEnded(true);
    if (resolvedSessionId) {
      try {
        await fetch(`${API}/api/chat/sessions/${resolvedSessionId}/end`, {
          method: "POST",
          credentials: "include",
          headers: authHeaders(),
          body: JSON.stringify({}),
        });
      } catch (_) {}
    }
    onSessionEnded(resolvedSessionId, null);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show mood selection fullscreen before chat starts
  if (showStartMood) {
    return (
      <div className="chat-window center-content">
        <MoodModal
          title="How are you feeling right now?"
          subtitle="This helps Sukhi understand where you are today"
          onSelect={(m) => {
            setStartMood(m);
            setShowStartMood(false);
          }}
          onSkip={() => setShowStartMood(false)}
        />
      </div>
    );
  }

  return (
    <div className="chat-window">
      {showFeedback && (
        <FeedbackModal
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
        />
      )}

      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          {!sidebarOpen && (
            <button
              className="icon-btn"
              onClick={onToggleSidebar}
              title="Open sessions"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
          <div className="bot-avatar-lg">
            <span>S</span>
            <span className="online-dot" />
          </div>
          <div className="header-info">
            <h1 className="header-title">
              sukhi<span>.ai</span>
            </h1>
            <p className="header-sub">
              Your Safe Space · Always here
              {startMood && (
                <span className="header-mood-badge">
                  {MOODS.find((m) => m.label === startMood)?.emoji} {startMood}
                </span>
              )}
            </p>
          </div>
        </div>
        {!isEnded ? (
          <button className="end-session-btn" onClick={handleEndClick}>
            End Session
          </button>
        ) : (
          <span className="session-ended-badge">Session Ended</span>
        )}
      </header>

      {/* Messages */}
      <div className="messages-area" ref={messagesRef}>
        {loadingHistory ? (
          <div className="history-loading">Loading conversation…</div>
        ) : (
          <>
            <div className="date-divider">
              <span>Today</span>
            </div>

            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`msg-row ${msg.from}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {msg.from === "bot" && (
                  <div className="bot-avatar-sm">
                    <span>S</span>
                  </div>
                )}
                <div className="bubble-wrap">
                  <div className={`bubble ${msg.from}`}>
                    <p>{msg.text}</p>
                  </div>
                  <span className="msg-time">{msg.time}</span>
                </div>
                {msg.from === "user" && (
                  <div className="user-avatar-sm">
                    <svg
                      width="13"
                      height="13"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="msg-row bot">
                <div className="bot-avatar-sm">
                  <span>S</span>
                </div>
                <div className="bubble bot typing-bubble">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {!isTyping && !isEnded && suggestions.length > 0 && (
              <div className="suggestions-row">
                <span className="suggestions-label">You might ask…</span>
                <div className="suggestions-chips">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="suggestion-chip"
                      onClick={() => {
                        setSuggestions([]);
                        sendMessage(s);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {loadingSuggestions && !isTyping && (
              <div className="suggestions-loading">Finding suggestions…</div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <footer className="chat-footer">
        {isEnded ? (
          <div className="session-ended-notice">
            This session has ended. Start a new session to continue.
          </div>
        ) : (
          <div className="input-shell">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Share what's on your mind…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              className={`send-btn ${input.trim() ? "active" : ""}`}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9l20-7z" />
              </svg>
            </button>
          </div>
        )}
        <p className="footer-note">
          sukhi.ai is an emotional support companion, not a substitute for
          professional care.
        </p>
      </footer>
    </div>
  );
}

// ─── Empty landing state ───────────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🧡</div>
      <h2 className="empty-title">Your safe space</h2>
      <p className="empty-sub">
        Every journey begins with a single conversation.
        <br />
        Start a new session whenever you're ready.
      </p>
      <button className="start-btn" onClick={onNew}>
        <svg
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Start a New Session
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActive] = useState(null);
  const [pendingNew, setPendingNew] = useState(false);
  const [panelKey, setPanelKey] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/chat/sessions`, {
          credentials: "include",
          headers: authHeaders(),
        });
        const data = await res.json();
        if (data.success)
          setSessions((data.sessions || []).map(normalizeSession));
      } catch (_) {
      } finally {
        setLoadingSessions(false);
      }
    })();
  }, []);

  const handleNew = useCallback(() => {
    setActive(null);
    setPendingNew(true);
    setPanelKey("pending-" + Date.now());
  }, []);

  const handleSelect = (id) => {
    if (!id) return;
    setPendingNew(false);
    setActive(id);
    setPanelKey(id);
  };

  const handleSessionCreated = useCallback((session) => {
    const normalized = normalizeSession(session);
    setSessions((prev) => [normalized, ...prev]);
    setActive(normalized._id);
  }, []);

  const handleSessionEnded = useCallback((sessionId, _feedbackData) => {
    if (sessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          getSessionId(s) === sessionId ? { ...s, ended: true } : s,
        ),
      );
    }
    setActive(null);
    setPendingNew(false);
    setPanelKey("ended-" + Date.now());
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;
      try {
        await fetch(`${API}/api/chat/sessions/${id}`, {
          method: "DELETE",
          credentials: "include",
          headers: authHeaders(),
        });
        setSessions((prev) => prev.filter((s) => getSessionId(s) !== id));
        if (activeSessionId === id) {
          setActive(null);
          setPendingNew(false);
          setPanelKey("deleted-" + Date.now());
        }
      } catch (_) {}
    },
    [activeSessionId],
  );

  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/chat/sessions`, {
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success)
        setSessions((data.sessions || []).map(normalizeSession));
    } catch (_) {}
  }, []);

  useEffect(() => {
    const t = setInterval(refreshSessions, 8000);
    return () => clearInterval(t);
  }, [refreshSessions]);

  const showChat = pendingNew || !!activeSessionId;

  return (
    <div className="chat-root">
      <CustomCursor />
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="chat-layout">
        {sidebarOpen && (
          <Sidebar
            sessions={sessions}
            activeId={activeSessionId}
            onSelect={handleSelect}
            onNew={handleNew}
            onClose={() => setSidebarOpen(false)}
            onDelete={handleDelete}
            loading={loadingSessions}
          />
        )}

        <div className="chat-main">
          {!sidebarOpen && (
            <button
              className="sidebar-reopen-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open sessions"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {showChat ? (
            <ChatPanel
              key={panelKey}
              sessionId={pendingNew ? null : activeSessionId}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen((o) => !o)}
              onSessionCreated={handleSessionCreated}
              onSessionEnded={handleSessionEnded}
            />
          ) : (
            <EmptyState onNew={handleNew} />
          )}
        </div>
      </div>
    </div>
  );
}
