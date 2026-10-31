import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../services/api';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(() => {
    return sessionStorage.getItem('fitsense_chat_open') === 'true';
  });

  const [history, setHistory] = useState(() => {
    try {
      const stored = sessionStorage.getItem('fitsense_chat_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('fitsense_chat_open', isOpen ? 'true' : 'false');
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('fitsense_chat_history', JSON.stringify(history));
    scrollToBottom();
  }, [history]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const newHistory = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(text);
      const botReply = res.data?.reply || "I couldn't generate a response.";
      
      const updated = [...newHistory, { role: 'assistant', content: botReply }];
      // Keep last 10 messages
      const trimmed = updated.length > 10 ? updated.slice(-10) : updated;
      setHistory(trimmed);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setHistory(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't process that right now — please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fitsense-chat-widget">
      <div
        className="fitsense-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with FitSense Assistant"
        style={{ position: 'relative' }}
      >
        {hasUnread && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ff1744',
              border: '2px solid var(--panel-bg)'
            }}
          />
        )}
        <MessageSquare size={26} />
      </div>

      <div className={`fitsense-chat-panel ${isOpen ? 'open' : ''}`}>
        <div className="fitsense-chat-header">
          <div className="fitsense-chat-header-title">
            <div className="fitsense-chat-bot-icon">
              <Bot size={18} />
            </div>
            <div className="fitsense-chat-header-text">
              <span className="fitsense-chat-title-main">FitSense Assistant</span>
              <span className="fitsense-chat-title-sub">
                <span className="fitsense-chat-status-dot" />
                Online
              </span>
            </div>
          </div>
          <button
            className="fitsense-chat-close"
            onClick={() => setIsOpen(false)}
            title="Minimize"
          >
            <X size={18} />
          </button>
        </div>

        <div className="fitsense-chat-messages">
          <div className="fitsense-chat-msg fitsense-chat-msg-bot">
            <div className="fitsense-chat-avatar">
              <Bot size={14} />
            </div>
            <div className="fitsense-chat-msg-text">
              Hi! I am your FitSense Coach. Ask me any questions about fitness, nutrition, workouts, or goals!
            </div>
          </div>

          {history.map((msg, idx) => (
            <div
              key={idx}
              className={`fitsense-chat-msg fitsense-chat-msg-${msg.role === 'user' ? 'user' : 'bot'}`}
            >
              {msg.role !== 'user' && (
                <div className="fitsense-chat-avatar">
                  <Bot size={14} />
                </div>
              )}
              <div className="fitsense-chat-msg-text">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="fitsense-chat-msg fitsense-chat-msg-bot">
              <div className="fitsense-chat-avatar">
                <Bot size={14} />
              </div>
              <div className="fitsense-chat-msg-text" style={{ fontStyle: 'italic', opacity: 0.8 }}>
                FitSense AI is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="fitsense-chat-input-area">
          <input
            type="text"
            className="fitsense-chat-input"
            placeholder="Ask about fitness, nutrition, goals..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="fitsense-chat-send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
