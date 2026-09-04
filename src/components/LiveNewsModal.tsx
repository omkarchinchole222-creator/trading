import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Volume2,
} from 'lucide-react';

interface NewsArticle {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  timestamp: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  priceImpact: string;
  volumeContext: string;
}

interface LiveNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const LiveNewsModal: React.FC<LiveNewsModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchSymbol, setSearchSymbol] = useState<string>('');

  const fetchNews = async (cat = selectedCategory, sym = searchSymbol) => {
    setLoading(true);
    try {
      let url = `/api/verified-news?category=${cat}`;
      if (sym) url += `&symbol=${sym}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setNews(json.news || []);
      }
    } catch (e) {
      console.error('Failed to fetch verified news:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews(selectedCategory, searchSymbol);
    }
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Verified News' },
    { id: 'corporate', label: 'Corporate Actions & Expansion' },
    { id: 'earnings', label: 'Earnings & Big Contracts' },
    { id: 'macro', label: 'Macro & RBI Policy' },
    { id: 'dividends', label: 'Dividends & Buybacks' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#151921] border border-[#2A2E39] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#0B0E11]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#26A69A]/15 text-[#26A69A]">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Categorized Verified News Feed & Spotlights
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/30">
                  Tickertape Parity
                </span>
              </h2>
              <p className="text-xs text-[#787B86]">
                Timestamped regulatory announcements and verified news wires with inline volume-vs-average context
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNews(selectedCategory, searchSymbol)}
              disabled={loading}
              className="p-1.5 rounded text-[#787B86] hover:text-white hover:bg-[#2A2E39] cursor-pointer"
              title="Refresh News Feed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-mono text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded cursor-pointer"
            >
              ✕ Esc
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-3 bg-[#0B0E11] border-b border-[#2A2E39] overflow-x-auto text-xs font-mono">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#26A69A] text-black font-bold'
                  : 'bg-[#151921] text-[#787B86] hover:text-[#D1D4DC] border border-[#2A2E39]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* News Cards Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {news.length === 0 && !loading && (
            <div className="text-center py-10 text-xs font-mono text-[#787B86]">
              No verified news articles found in this window.
            </div>
          )}

          {news.map((item) => (
            <div
              key={item.id}
              className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39] hover:border-[#26A69A]/50 transition-all space-y-2.5"
            >
              {/* Top Meta Line */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onSelectStock) onSelectStock(item.symbol);
                    }}
                    className="font-bold text-white px-2 py-0.5 rounded bg-[#1E222D] hover:bg-[#26A69A] hover:text-black transition-colors cursor-pointer"
                  >
                    {item.symbol}
                  </button>
                  <span className="text-[#787B86] flex items-center gap-1">
                    <Tag className="h-3 w-3 text-[#26A69A]" /> {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[#26A69A] font-bold">{item.priceImpact} Move</span>
                  <span className="text-[#787B86]">•</span>
                  <span className="text-[#787B86]">{item.timestamp}</span>
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-sm font-semibold text-[#D1D4DC] leading-snug">
                {item.headline}
              </h3>

              {/* Bottom Context & Source */}
              <div className="pt-2 border-t border-[#2A2E39] flex flex-wrap items-center justify-between gap-2 text-[10.5px] font-mono">
                <div className="flex items-center gap-1.5 text-[#26A69A]">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Source: {item.source}</span>
                </div>

                <div className="text-[#787B86] bg-[#151921] px-2 py-0.5 rounded border border-[#2A2E39]">
                  Volume: <strong className="text-white">{item.volumeContext}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B0E11] border-t border-[#2A2E39] flex items-center justify-between text-[11px] font-mono text-[#787B86]">
          <span>Anti-Hallucination Policy: Verified exchange filings & news wires only.</span>
          <span className="text-[#26A69A]">100% Sourced & Timestamped</span>
        </div>
      </div>
    </div>
  );
};
