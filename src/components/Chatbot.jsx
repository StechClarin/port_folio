import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: language === 'fr' 
        ? "Bonjour ! Je suis Etherna. Comment puis-je vous aider aujourd'hui ?"
        : "Hello! I'm Etherna. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessages = [
      ...messages,
      { id: Date.now(), sender: 'user', text: inputValue }
    ];
    setMessages(newMessages);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: language === 'fr'
            ? "Merci pour votre message. Je suis encore en phase d'apprentissage, mais un humain prendra le relais bientôt !"
            : "Thank you for your message. I'm still learning, but a human will take over soon!"
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[400px] bg-[#0a0a0f]/95 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_10px_50px_rgba(139,92,246,0.3)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <Bot size={18} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Etherna</h3>
                <p className="text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {language === 'fr' ? 'En ligne' : 'Online'}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-violet-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900/50 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={language === 'fr' ? 'Écrivez votre message...' : 'Type your message...'}
                className="w-full bg-slate-800/80 text-white text-sm rounded-full pl-4 pr-12 py-3 border border-white/10 focus:outline-none focus:border-violet-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-500"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 ${
          isOpen 
            ? 'bg-slate-800 border border-white/10' 
            : 'bg-gradient-to-br from-violet-600 to-blue-600 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

export default Chatbot;
