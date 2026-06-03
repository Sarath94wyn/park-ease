import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, CornerDownLeft, Sparkles, Mic, MicOff, MapPin, Compass } from 'lucide-react';
import { sendMessage } from '../../services/chatbotService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  "Find parking in Kochi",
  "Available lots in Trivandrum",
  "How much is Lulu Mall Parking?",
  "How to book a slot?",
  "What is available right now?",
];

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your ParkEase AI Assistant. How can I help you find or book a parking spot today?",
      suggestions: SUGGESTIONS
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
        toast.success("Listening... Speak now!");
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        toast.success("Speech captured!");
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        toast.error("Could not capture speech. Try again.");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser. Try Chrome, Edge or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput('');
      recognitionRef.current.start();
    }
  };

  const handleSend = async (textToSend) => {
    const cleanText = textToSend || input.trim();
    if (!cleanText) return;

    // Append User message
    const newMsg = { sender: 'user', text: cleanText };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessage(cleanText);
      const chatData = response.data || response;
      
      // Append bot response
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: chatData.reply || "I'm sorry, I couldn't understand that.",
        suggestions: chatData.suggestions || [],
        data: chatData.data || null
      }]);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I'm having trouble syncing with the server right now. Please try again in a moment.",
        suggestions: ["Try again"]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleViewOnMap = (lot) => {
    if (lot.location && lot.location.coordinates) {
      const [lng, lat] = lot.location.coordinates;
      navigate(`/explore?lat=${lat}&lng=${lng}&name=${encodeURIComponent(lot.name)}`);
      onClose();
    } else {
      toast.error('Coordinates not available for this parking lot');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-primary-700 to-indigo-800 p-4 flex items-center justify-between border-b border-indigo-900 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-slate-200/80 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-cyan-600" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-200"></span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-tight flex items-center gap-1 text-white">
              <span>ParkEase Assistant</span>
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse-slow" />
            </h4>
            <span className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider block">AI Agent Active</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages body list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, index) => {
          const isBot = msg.sender === 'bot';

          return (
            <div key={index} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              {/* Icon badge */}
              <div className={`w-7.5 h-7.5 rounded-full shrink-0 flex items-center justify-center border ${
                isBot ? 'bg-slate-100 border-slate-300 text-cyan-600' : 'bg-primary-600 border-primary-500 text-white'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message text card */}
              <div className="space-y-3 w-full">
                <div className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm whitespace-pre-line ${
                  isBot
                    ? 'bg-slate-100/60 border border-slate-200 text-slate-800 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>

                {/* Displaying mockup/real parking locations returned from query */}
                {isBot && msg.data && Array.isArray(msg.data) && (
                  <div className="space-y-2 mt-2">
                    {msg.data.map((lot) => (
                      <div key={lot._id || lot.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3.5 shadow-sm">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h5 className="font-extrabold text-xs text-slate-900">{lot.name}</h5>
                            <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-cyan-600" />
                              <span>{lot.address}</span>
                            </p>
                          </div>
                          <span className="text-[11px] font-black text-cyan-600 shrink-0">₹{lot.pricePerHour}/hr</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2.5">
                          <span className="text-[10px] font-bold text-emerald-700">🅿️ {lot.availableSlots} slots free</span>
                          <button
                            type="button"
                            onClick={() => handleViewOnMap(lot)}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white font-extrabold text-[9px] rounded-lg uppercase tracking-wider flex items-center gap-1 select-none shadow-sm active:scale-95 transition-all"
                          >
                            <Compass className="w-3 h-3" />
                            <span>View on Map</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline clickable Quick Replies suggestions */}
                {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(sug)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-cyan-700 hover:text-cyan-800 rounded-xl border border-slate-200 active:scale-95 transition-all"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Bouncing Dots Loading/Typing Indicators */}
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7.5 h-7.5 rounded-full bg-slate-100 border border-slate-300 text-cyan-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100/60 border border-slate-200 px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-1 h-9">
              <span className="w-2 h-2 rounded-full bg-cyan-400 typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 typing-dot"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 typing-dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input controls box */}
      <div className="p-3 bg-slate-100/40 border-t border-slate-200/80">
        <div className="relative flex items-center bg-slate-100 border border-slate-300 rounded-2xl focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
          <input
            type="text"
            placeholder={isListening ? "Listening..." : "Type a message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading || isListening}
            className="flex-1 bg-transparent px-4 py-3 text-xs placeholder-slate-500 focus:outline-none disabled:opacity-50 text-slate-900 font-semibold"
          />

          <div className="flex items-center gap-1.5 pr-2.5">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`p-2 rounded-xl transition-all shadow ${
                isListening 
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                  : 'bg-white hover:bg-slate-200 text-slate-700'
              }`}
              title={isListening ? "Stop listening" : "Start voice typing"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            {/* Enter key shortcut badge */}
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] text-slate-500 font-bold bg-white border border-slate-750 px-1.5 py-0.5 rounded uppercase select-none">
              <span>Enter</span>
              <CornerDownLeft className="w-2 h-2" />
            </span>

            <button
              type="button"
              disabled={loading || !input.trim() || isListening}
              onClick={() => handleSend()}
              className="p-2 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 text-white disabled:text-slate-600 rounded-xl transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
