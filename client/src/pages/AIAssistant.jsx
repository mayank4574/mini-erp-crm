import React, { useState, useRef, useEffect } from 'react';
import api from '../utils/api';
import { Bot, User, Send, Sparkles, Loader2, RefreshCcw } from 'lucide-react';
import { cn } from '../utils/cn';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I'm your Mini ERP AI Assistant. I can help you analyze inventory, sales challans, and customer data. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "Show low stock products",
    "Which customers need follow-up?",
    "Summarize recent challans",
    "Give me today's business summary",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: text });
      const aiMsg = { id: Date.now() + 1, role: 'assistant', content: res.data.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: "Chat cleared. How can I help you?",
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Business Assistant</h2>
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Powered by Gemini
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-slate-50/30">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "flex max-w-[85%] md:max-w-[75%] lg:max-w-[65%] gap-3",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm",
                msg.role === 'user' ? "bg-primary text-white" : "bg-white border border-slate-200 text-primary"
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-sm" 
                  : msg.isError 
                    ? "bg-danger/10 text-danger border border-danger/20 rounded-tl-sm"
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-sm text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 rounded-tl-sm flex items-center gap-2 shadow-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">Analyzing business data...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions & Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white shrink-0">
        
        <div className="flex overflow-x-auto gap-2 pb-3 mb-1 custom-scrollbar hide-scrollbar-on-mobile">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about inventory, challans, or customers..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-slate-700 transition-all disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-lg bg-primary text-white disabled:bg-slate-300 disabled:text-slate-500 transition-colors hover:bg-primary-dark"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AIAssistant;
