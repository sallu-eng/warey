import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, Bot, Loader } from 'lucide-react';
import { ChatBubble } from '../components/index';

const Chatbot = ({ user }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      text: `Hello ${user?.name || 'there'}, I'm Warey AI. Ask me about stock, locations, or report issues.`,
      isBot: true,
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  // Fetch Chat History
  useEffect(() => {
    const fetchHistory = async () => {
      const employeeId = user?.id || user?.employeeId;
      if (!employeeId) return;

      try {
        const res = await axios.get(`http://localhost:3000/api/ai/history/${employeeId}`);

        if (res.data && res.data.length > 0) {
          const formattedHistory = res.data.map((msg) => ({
            text: msg.content,
            isBot: msg.role === 'assistant' || msg.role === 'system',
          }));

          setMessages((prev) => [prev[0], ...formattedHistory]);
        }
      } catch (err) {
        console.error('Could not load chat history', err);
      }
    };

    fetchHistory();
  }, [user]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-scroll to the bottom when messages or typing status change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  // Handle sending a message
  const handleSend = async (text) => {
    const sanitizedText = text?.trim();
    if (!sanitizedText) return;

    window.speechSynthesis.cancel();

    setMessages((prev) => [...prev, { text: sanitizedText, isBot: false }]);
    setQuery('');
    setIsTyping(true);

    try {
      const employeeId = user?.id || user?.employeeId || 'default_user';

      const res = await axios.post('http://localhost:3000/api/ai/query', {
        query: sanitizedText,
        employeeId: employeeId,
      });

      const botResponse =
        typeof res.data.response === 'string'
          ? res.data.response
          : JSON.stringify(res.data.response);

      setMessages((prev) => [...prev, { text: botResponse, isBot: true }]);

      const utterance = new SpeechSynthesisUtterance(botResponse);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { text: 'Connection error. Ensure the backend is active.', isBot: true },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Toggle voice recognition
  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center h-100 py-4">
      <div
        className="border-0 w-100"
        style={{
          maxWidth: '850px',
          height: 'calc(100vh - 120px)',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-hover)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="p-3" style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3" style={{ background: 'var(--primary)' }}>
              <Bot size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Warey AI Assistant</h5>
              <small className="fw-medium" style={{ color: isListening ? '#ef4444' : '#10b981' }}>
                {isListening ? '🔴 Listening to you...' : '🟢 Online'}
              </small>
            </div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="overflow-auto p-4 d-flex flex-column gap-3" ref={scrollRef} style={{ flex: 1 }}>
          {messages.map((m, i) => (
            <ChatBubble key={i} message={m} />
          ))}

          {isTyping && (
            <div className="d-flex align-items-center gap-2 p-3 rounded-4 align-self-start" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-dim)' }}>
              <Bot size={16} />
              <span className="small fw-medium">Warey is thinking...</span>
              <Loader size={14} className="spin-animation" />
            </div>
          )}
        </div>

        {/* Footer / Input Area */}
        <div className="p-3" style={{ backgroundColor: 'var(--surface-hover)', borderTop: '1px solid var(--glass-border)' }}>
          <div className="input-group rounded-pill shadow-sm p-1" style={{ backgroundColor: 'var(--surface-hover)', border: '1px solid var(--glass-border)' }}>
            <button
              className="btn rounded-circle d-flex align-items-center justify-content-center border-0"
              onClick={toggleVoice}
              disabled={isTyping}
              style={{
                width: '45px',
                height: '45px',
                background: isListening ? '#ef4444' : 'var(--primary)',
                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                opacity: isTyping ? 0.5 : 1,
              }}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? <MicOff size={20} color="#fff" /> : <Mic size={20} color="#fff" />}
            </button>

            <input
              type="text"
              className="form-control border-0 shadow-none px-3"
              placeholder={isListening ? 'Listening...' : 'Type your query here...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
              disabled={isTyping || isListening}
              style={{ backgroundColor: 'transparent', color: 'var(--text-main)' }}
            />

            <button
              className="btn rounded-circle d-flex align-items-center justify-content-center border-0"
              onClick={() => handleSend(query)}
              disabled={!query.trim() || isTyping}
              style={{
                width: '45px',
                height: '45px',
                background: 'var(--primary)',
                opacity: !query.trim() || isTyping ? 0.5 : 1,
              }}
            >
              {isTyping ? (
                <Loader size={20} className="spin-animation" style={{ color: '#fff' }} />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;