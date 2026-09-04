import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Bot,
  User,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { ScannedStock } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  symbol?: string;
  metrics?: {
    price: number;
    ema20: number;
    ema50: number;
    ema200: number;
    rsi: number;
  };
  timestamp: string;
}

interface AskStockChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStock?: ScannedStock | null;
  onSelectStock?: (symbol: string) => void;
}

export const AskStockChatModal: React.FC<AskStockChatModalProps> = ({
  isOpen,
  onClose,
  initialStock,
  onSelectStock,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Quantitative Research Assistant. Ask me anything about Indian equities (e.g. "Is RELIANCE a buy right now?", "Why did TATASTEEL drop today?", or "Show the technical setup for HDFCBANK").

Every analysis is strictly grounded in verified technical data, 20/50/200 EMAs, RSI, and verified regulatory filings.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialStock && isOpen) {
      setInputValue(`Is ${initialStock.symbol} a buy right now? What are the key support and invalidation levels?`);
    }
  }, [initialStock, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/ask-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI analysis');
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer,
        symbol: data.symbol,
        metrics: data.metrics,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an error while analyzing this stock. Please check the stock ticker and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Is RELIANCE a buy right now?',
    'What is the technical setup on TATAMOTORS?',
    'Why did HDFCBANK drop recently?',
    'Compare TCS vs INFY setup',
    'Show support/resistance on HAL',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#151921] border border-[#2A2E39] rounded-lg max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#0B0E11]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#26A69A]/15 text-[#26A69A]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Conversational Stock Research AI
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/30">
                  Incite AI Parity
                </span>
              </h2>
              <p className="text-xs text-[#787B86]">
                SEBI-compliant, probability-framed analysis pulling live technicals, EMAs, RSI, and verified filings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded cursor-pointer"
          >
            ✕ Esc
          </button>
        </div>

        {/* Quick Sample Queries */}
        <div className="p-2.5 bg-[#0B0E11] border-b border-[#2A2E39] flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-[#787B86] whitespace-nowrap">Suggested:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded bg-[#151921] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#2A2E39] whitespace-nowrap transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`p-2 rounded-full shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-[#2A2E39] text-white'
                    : 'bg-[#26A69A]/20 text-[#26A69A]'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-lg p-3.5 space-y-2 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#26A69A] text-black font-medium'
                    : 'bg-[#0B0E11] text-[#D1D4DC] border border-[#2A2E39]'
                }`}
              >
                {/* Metric Summary Badge if available */}
                {msg.metrics && msg.symbol && (
                  <div className="mb-2 p-2 rounded bg-[#151921] border border-[#2A2E39] flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-[#787B86]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{msg.symbol}</span>
                      <span className="text-[#26A69A] font-bold">₹{msg.metrics.price}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>20 EMA: ₹{msg.metrics.ema20}</span>
                      <span>50 EMA: ₹{msg.metrics.ema50}</span>
                      <span>RSI: {msg.metrics.rsi}</span>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans text-xs">
                  {msg.text}
                </div>

                <div
                  className={`text-[9.5px] font-mono text-right ${
                    msg.sender === 'user' ? 'text-black/70' : 'text-[#787B86]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#26A69A]/20 text-[#26A69A] shrink-0">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-[#0B0E11] border border-[#2A2E39] rounded-lg p-3 text-xs font-mono text-[#787B86] flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#26A69A] animate-pulse" />
                <span>Crunching EMAs, RSI, and regulatory filings with Gemini...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#0B0E11] border-t border-[#2A2E39]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about any NSE/BSE stock setup, technical levels, or catalyst news..."
              className="flex-1 px-3.5 py-2.5 bg-[#151921] border border-[#2A2E39] rounded text-xs font-sans text-white placeholder-[#787B86] focus:outline-none focus:border-[#26A69A]"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-2.5 bg-[#26A69A] hover:bg-[#208b81] disabled:opacity-50 text-black font-bold rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="h-3.5 w-3.5" /> Send
            </button>
          </form>

          <div className="mt-2 text-[10px] font-mono text-[#787B86] text-center">
            Educational & quantitative research only. Not registered SEBI investment advice.
          </div>
        </div>
      </div>
    </div>
  );
};
