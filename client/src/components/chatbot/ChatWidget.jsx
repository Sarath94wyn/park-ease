import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Expandable chat window */}
      {isOpen && (
        <div className="mb-4 animate-slide-up w-[90vw] sm:w-[380px] h-[550px] shadow-2xl rounded-3xl overflow-hidden border border-slate-200/80">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-neon/50 active:scale-95 transition-all duration-300 relative group animate-bounce-gentle"
      >
        {isOpen ? (
          <X className="w-6 h-6 rotate-90 transition-transform duration-300" />
        ) : (
          <MessageSquare className="w-6 h-6 transition-transform duration-300" />
        )}

        {/* Pulse outline ring */}
        {!isOpen && (
          <div className="absolute inset-0 border border-primary-500 rounded-full animate-ping pointer-events-none opacity-40"></div>
        )}

        {/* Tooltip bubble */}
        {!isOpen && (
          <span className="absolute right-16 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 whitespace-nowrap transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            Assistant Chat
          </span>
        )}
      </button>
    </div>
  );
}
