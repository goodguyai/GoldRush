
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from './types';
import { Send, MessageCircle } from './Icons';

interface LeagueChatProps {
  currentUser: User;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

const LeagueChat: React.FC<LeagueChatProps> = ({ currentUser, messages, onSendMessage }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full bg-neu-base">
      {/* Messages Container - Proper spacing from top */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 pt-4 pb-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-16 h-16 neu-button rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <MessageCircle size={28} />
            </div>
            <p className="font-bold text-gray-400 mb-1">No messages yet</p>
            <p className="text-xs text-gray-300">Be the first to say something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              // System Message Style
              if (msg.userId === 'system') {
                return (
                  <div key={msg.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mx-4 my-2 text-center animate-fade-in">
                    <div className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-1">System Audit</div>
                    <div className="text-xs font-bold text-yellow-800 whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </div>
                    <div className="text-[9px] text-yellow-600/60 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                );
              }

              const isMe = msg.userId === currentUser.id;
              const showName = idx === 0 || messages[idx - 1].userId !== msg.userId;
              
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Name label */}
                  {showName && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 px-1 ${
                      isMe ? 'text-electric-500' : 'text-gray-400'
                    }`}>
                      {isMe ? 'You' : msg.userName}
                    </span>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`max-w-[80%] ${isMe ? 'order-1' : 'order-1'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      isMe 
                        ? 'bg-electric-600 text-white rounded-br-md shadow-lg shadow-electric-500/20' 
                        : 'neu-card rounded-bl-md'
                    }`}>
                      <p className={`text-sm font-medium leading-relaxed ${isMe ? '' : 'text-gray-800'}`}>
                        {msg.text}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    <p className={`text-[9px] font-medium mt-1 px-1 ${
                      isMe ? 'text-right text-gray-400' : 'text-gray-300'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString(undefined, { 
                        hour: 'numeric', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area - Floating card style with soft styling */}
      <div className="flex-shrink-0 p-4 pb-safe">
        <div className="flex items-center gap-2 p-2 rounded-2xl"
          style={{
            background: '#EFEEF3',
            boxShadow: '4px 4px 8px rgba(163, 163, 168, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.9)'
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Broadcast message..."
            className="flex-1 px-3 py-2.5 bg-transparent text-sm font-medium text-gray-900 placeholder-gray-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{
              background: text.trim() ? '#0085C7' : 'transparent',
              color: text.trim() ? 'white' : '#9CA3AF',
              boxShadow: text.trim() 
                ? '3px 3px 6px rgba(0, 133, 199, 0.3)'
                : 'none'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeagueChat;
