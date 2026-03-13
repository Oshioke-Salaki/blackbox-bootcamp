import { useState, useRef, useEffect, useCallback } from "react";
import "./ChatBot.css";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Welcome to Blackbox Bootcamp. I'm your FHE assistant — ask me anything about encrypted smart contracts, Zama's FHEVM, the curriculum, or how any concept works. What would you like to learn?",
};

const SUGGESTIONS = [
  "What is FHE and why does it matter?",
  "Explain FHE.select and the no-revert pattern",
  "How does ACL permission work in FHEVM?",
  "What's the difference between euint64 and externalEuint64?",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text) => {
      const userMsg = { role: "user", content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        // Send only role + content (strip out any extra fields)
        const apiMessages = newMessages
          .filter((m) => m.role !== "assistant" || m !== WELCOME_MESSAGE)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!res.ok) {
          throw new Error("Failed to get response");
        }

        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't connect right now. Please try again in a moment.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || loading) return;
      sendMessage(text);
    },
    [input, loading, sendMessage]
  );

  const handleSuggestion = useCallback(
    (text) => {
      if (loading) return;
      sendMessage(text);
    },
    [loading, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <>
      {/* Floating trigger button */}
      <button
        className={"chat-trigger" + (open ? " chat-trigger--open" : "")}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open AI assistant"}
      >
        {open ? (
          <span className="chat-trigger-icon">&times;</span>
        ) : (
          <span className="chat-trigger-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div className={"chat-panel" + (open ? " chat-panel--open" : "")}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <span className="chat-header-dot" />
            <div>
              <span className="chat-header-title">Blackbox AI</span>
              <span className="chat-header-sub">FHE Assistant</span>
            </div>
          </div>
          <button
            className="chat-header-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            &times;
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                "chat-msg" +
                (msg.role === "user" ? " chat-msg--user" : " chat-msg--bot")
              }
            >
              {msg.role === "assistant" && (
                <span className="chat-msg-avatar">BX</span>
              )}
              <div className="chat-msg-bubble">
                <ChatContent content={msg.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg chat-msg--bot">
              <span className="chat-msg-avatar">BX</span>
              <div className="chat-msg-bubble">
                <span className="chat-typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (only show if just welcome message) */}
        {messages.length === 1 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="chat-suggestion"
                onClick={() => handleSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="chat-input-bar" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Ask about FHE, FHEVM, Zama..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send"
            disabled={!input.trim() || loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

/* Simple markdown-ish renderer for code blocks and bold */
function ChatContent({ content }) {
  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.slice(3, -3).split("\n");
      const lang = lines[0].trim();
      const code = (lang ? lines.slice(1) : lines).join("\n").trim();
      return (
        <pre key={i} className="chat-code-block">
          <code>{code}</code>
        </pre>
      );
    }

    // Inline code
    const inlineParts = part.split(/(`[^`]+`)/g);
    return (
      <span key={i}>
        {inlineParts.map((p, j) => {
          if (p.startsWith("`") && p.endsWith("`")) {
            return (
              <code key={j} className="chat-inline-code">
                {p.slice(1, -1)}
              </code>
            );
          }
          // Bold
          const boldParts = p.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((bp, k) => {
            if (bp.startsWith("**") && bp.endsWith("**")) {
              return <strong key={`${j}-${k}`}>{bp.slice(2, -2)}</strong>;
            }
            return bp;
          });
        })}
      </span>
    );
  });
}
