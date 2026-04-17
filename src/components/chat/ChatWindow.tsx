import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showNewMessageToast } from '../../lib/notifications';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_broadcast?: boolean;
}

interface ChatWindowProps {
  currentUser: any;
  target: any | 'broadcast';
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, target }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [tone, setTone] = useState<'low' | 'mid' | 'high'>('mid');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBroadcast = target === 'broadcast';
  const targetName = isBroadcast ? 'Difusión General' : target.name;

  // Simulate historical messages
  useEffect(() => {
    setMessages([
      { id: '1', sender_id: 'secretary', content: 'Hola, ¿cómo va todo?', created_at: new Date().toISOString() },
      { id: '2', sender_id: 'consultorio_1', content: '¡Hola! Todo bien por aquí.', created_at: new Date().toISOString() },
    ]);
  }, [target]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender_id: currentUser.role,
      content: inputValue,
      created_at: new Date().toISOString(),
      is_broadcast: isBroadcast
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // Simulate incoming response for toast demo
    setTimeout(() => {
      showNewMessageToast(targetName, "¡Recibido!", tone);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Target Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isBroadcast ? 'bg-orange-100 text-orange-600' : 'bg-tiffany-soft text-tiffany-green'}`}>
            {isBroadcast ? 'D' : targetName.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{targetName}</h3>
            <p className="text-[10px] text-green-500 font-medium">Chat Activo</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-medical-gray/30 p-1 rounded-lg">
            {(['low', 'mid', 'high'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${
                  tone === t ? 'bg-white text-tiffany-green shadow-sm' : 'text-text-secondary hover:bg-white/50'
                }`}
              >
                {t}
              </button>
            ))}
            <div className="ml-2 pr-2">
              <Volume2 size={14} className="text-text-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Thread */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
        style={{ backgroundImage: 'radial-gradient(var(--tiffany-soft) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg: Message) => {
            const isMe = msg.sender_id === currentUser.role;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm relative ${
                  isMe 
                    ? 'bg-tiffany-green text-white rounded-tr-none' 
                    : 'bg-white border border-medical-gray text-text-primary rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`text-[9px] mt-2 flex items-center justify-end opacity-60 ${isMe ? 'text-white' : 'text-text-secondary'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 bg-medical-gray/30 p-2 rounded-2xl"
        >
          <button type="button" className="p-2 text-text-secondary hover:text-tiffany-green transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isBroadcast ? "Escriba un mensaje para todos..." : "Escriba un mensaje..."}
            className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-text-primary"
          />
          <button 
            type="submit" 
            className={`p-3 rounded-xl transition-all ${
              inputValue.trim() 
                ? 'bg-tiffany-green text-white shadow-lg shadow-tiffany-green/20' 
                : 'bg-medical-gray text-white opacity-50 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
