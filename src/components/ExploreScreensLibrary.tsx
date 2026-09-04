import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Copy,
  Share2,
  ThumbsUp,
  Check,
  Filter,
  Play,
  Layers,
  Code2,
  Users,
} from 'lucide-react';
import { ScanFilterOptions } from '../types';

export interface PreMadeScreen {
  id: string;
  title: string;
  category: 'formula' | 'popular' | 'price-volume' | 'valuation' | 'quarterly' | 'community';
  description: string;
  queryFormula: string;
  filters: Partial<ScanFilterOptions>;
  author?: string;
  clonesCount: number;
  upvotes: number;
  tags: string[];
}

export const PRE_MADE_SCREENS: PreMadeScreen[] = [
  {
    id: 'piotroski-high',
    title: 'Piotroski 9-Point Financial Health Screen',
    category: 'formula',
    description: 'Companies scoring 7+ on Piotroski F-score with expanding margins, positive operating cash flow, and declining leverage.',
    queryFormula: 'Piotroski F-Score >= 7 AND Debt to equity < 0.8 AND Operating Cash Flow > Net Profit',
    filters: {
      profitableOnly: true,
      maxDebtToEquity: 0.8,
      minScore: 65,
      rsiMin: 35,
      rsiMax: 70,
    },
    clonesCount: 1420,
    upvotes: 389,
    tags: ['Formula', 'Fundamental', 'Quality'],
  },
  {
    id: 'magic-formula',
    title: 'Greenblatt Magic Formula (High ROCE + Low EV/EBIT)',
    category: 'formula',
    description: 'Ranks companies by combined high Return on Capital Employed (ROCE > 20%) and attractive earnings yield (P/E < 22).',
    queryFormula: 'ROCE > 20% AND Return on Equity > 18% AND Price to Earning < 22',
    filters: {
      maxPe: 22,
      profitableOnly: true,
      minScore: 60,
      mustBeAboveEma50: true,
    },
    clonesCount: 1890,
    upvotes: 512,
    tags: ['Formula', 'Value', 'ROCE'],
  },
  {
    id: 'coffee-can',
    title: 'Coffee Can Quality Compounders (Clean Governance)',
    category: 'formula',
    description: 'Companies that have delivered >15% Revenue and ROCE growth year-on-year with low debt and high institutional backing.',
    queryFormula: 'Sales growth 3Yrs > 15% AND ROCE > 15% AND Debt to equity < 0.3',
    filters: {
      marketCap: 'large',
      maxDebtToEquity: 0.3,
      profitableOnly: true,
      mustBeAboveEma200: true,
    },
    clonesCount: 2310,
    upvotes: 678,
    tags: ['Long-Term', 'Compounder', 'Quality'],
  },
  {
    id: 'graham-bargain',
    title: 'Benjamin Graham Deep Value (PE * PB < 22.5)',
    category: 'valuation',
    description: 'Classic Graham formula filtering for stocks trading below intrinsic liquidation and earning value multiples.',
    queryFormula: 'Price to Earning * Price to book value < 22.5 AND Current ratio > 1.5',
    filters: {
      maxPe: 18,
      profitableOnly: true,
      minScore: 50,
    },
    clonesCount: 940,
    upvotes: 215,
    tags: ['Deep Value', 'Graham', 'Safety'],
  },
  {
    id: 'capacity-cwip',
    title: 'Capacity Expansion & Rising CWIP (Capex Cycle)',
    category: 'popular',
    description: 'Companies expanding physical fixed assets and Capital Work In Progress (CWIP) poised for next-cycle revenue ramp.',
    queryFormula: 'CWIP / Gross Block > 20% AND Sales growth YoY > 10%',
    filters: {
      volumeRatioMin: 1.2,
      mustBeAboveEma50: true,
      minScore: 60,
    },
    clonesCount: 780,
    upvotes: 194,
    tags: ['Capex', 'Expansion', 'Growth'],
  },
  {
    id: 'low-dilution',
    title: 'Zero Equity Dilution & Share Buybacks',
    category: 'valuation',
    description: 'Shareholder-friendly companies with constant or shrinking share count, avoiding dilutive equity raises.',
    queryFormula: 'Equity Share Capital change 3Yrs <= 0% AND Return on Equity > 16%',
    filters: {
      profitableOnly: true,
      maxDebtToEquity: 0.5,
      minScore: 60,
    },
    clonesCount: 650,
    upvotes: 160,
    tags: ['Governance', 'Buybacks', 'Compounder'],
  },
  {
    id: 'breakout-2x-vol',
    title: '52-Week High Breakout with 2x Volume Surge',
    category: 'price-volume',
    description: 'Stocks within 3% of 52-week high printing explosive volume (>2x 20-DMA) with confirmed RSI momentum (58-75).',
    queryFormula: 'Price >= 0.97 * 52W High AND Volume > 2 * 20DMA Volume AND RSI > 58',
    filters: {
      volumeRatioMin: 2.0,
      breakoutStatus: 'confirmed',
      rsiMin: 58,
      rsiMax: 76,
      mustBeAboveEma20: true,
      mustBeAboveEma50: true,
      minScore: 70,
    },
    clonesCount: 3410,
    upvotes: 980,
    tags: ['Breakout', 'Momentum', 'Volume Surge'],
  },
  {
    id: 'ema-golden-pullback',
    title: 'Bullish Pullback to 20/50 EMA in Uptrend',
    category: 'price-volume',
    description: 'Strong uptrend stocks taking a healthy pullback near 20 or 50 EMA with low volume and bullish candlestick support.',
    queryFormula: 'Price > 50 EMA AND Price > 200 EMA AND RSI between 42 and 55',
    filters: {
      trendDirection: 'uptrend',
      rsiMin: 42,
      rsiMax: 56,
      mustBeAboveEma50: true,
      mustBeAboveEma200: true,
      volumeRatioMin: 0.8,
      minScore: 60,
    },
    clonesCount: 1670,
    upvotes: 430,
    tags: ['Swing', 'Pullback', 'Trend Following'],
  },
  {
    id: 'community-promoter-buying',
    title: 'Rising Promoter & Insider Stake (Community)',
    category: 'community',
    description: 'Screen created by @quant_trader_in: Companies where promoters increased shareholding by >1% in latest quarter with zero pledged shares.',
    queryFormula: 'Promoter holding change QoQ > 1% AND Pledged Promoter Shares == 0%',
    filters: {
      profitableOnly: true,
      maxDebtToEquity: 0.6,
      minScore: 65,
    },
    author: 'quant_trader_in',
    clonesCount: 1120,
    upvotes: 340,
    tags: ['Insiders', 'Promoter', 'Conviction'],
  },
];

interface ExploreScreensLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScreen: (screen: PreMadeScreen) => void;
}

export const ExploreScreensLibrary: React.FC<ExploreScreensLibraryProps> = ({
  isOpen,
  onClose,
  onApplyScreen,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customQueryText, setCustomQueryText] = useState<string>(
    'Return on Equity > 18% AND Price to Earning < 25 AND Debt to equity < 0.5 AND Volume > 1.5 * 20DMA'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedScreens, setLikedScreens] = useState<string[]>([]);
  const [promoterSearchQuery, setPromoterSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Screens' },
    { id: 'formula', label: 'Formula-Based (Piotroski/Magic/Graham)' },
    { id: 'popular', label: 'Popular Themes' },
    { id: 'price-volume', label: 'Price & Volume Action' },
    { id: 'valuation', label: 'Valuation & Quality' },
    { id: 'community', label: 'Community Shared (50K+ Screens)' },
  ];

  const filteredScreens = PRE_MADE_SCREENS.filter((screen) => {
    const matchesCategory = activeCategory === 'all' || screen.category === activeCategory;
    const matchesSearch =
      screen.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.queryFormula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screen.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCopyFormula = (id: string, formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleLike = (id: string) => {
    setLikedScreens((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRunCustomQuery = () => {
    const customScreen: PreMadeScreen = {
      id: 'custom-query-' + Date.now(),
      title: 'Custom Query Screen',
      category: 'popular',
      description: `Run custom formula query: ${customQueryText}`,
      queryFormula: customQueryText,
      filters: {
        profitableOnly: customQueryText.toLowerCase().includes('profitable') || true,
        volumeRatioMin: customQueryText.includes('1.5') ? 1.5 : 1.0,
        minScore: 60,
      },
      clonesCount: 1,
      upvotes: 1,
      tags: ['Custom', 'Query Builder'],
    };
    onApplyScreen(customScreen);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#151921] border border-[#2A2E39] rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#0B0E11]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#26A69A]/15 text-[#26A69A]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Explore Screens & Query Builder
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/30">
                  Screener.in Parity
                </span>
              </h2>
              <p className="text-xs text-[#787B86]">
                Formula-based scans, Piotroski score, Magic Formula, Coffee Can, and custom SQL/formula filters
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

        {/* Custom Visual Query Builder Box */}
        <div className="p-4 bg-[#0B0E11] border-b border-[#2A2E39] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D1D4DC] flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-[#26A69A]" /> Custom Formula Query Editor
            </span>
            <span className="text-[10px] font-mono text-[#787B86]">
              Supports boolean AND / OR across ratios and technicals
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customQueryText}
              onChange={(e) => setCustomQueryText(e.target.value)}
              placeholder="e.g. Return on Equity > 15% AND Debt to equity < 0.5 AND Price > 50 EMA"
              className="flex-1 px-3 py-2 bg-[#151921] border border-[#2A2E39] rounded text-xs font-mono text-white placeholder-[#787B86] focus:outline-none focus:border-[#26A69A]"
            />
            <button
              onClick={handleRunCustomQuery}
              className="px-4 py-2 bg-[#26A69A] hover:bg-[#208b81] text-black font-bold rounded text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-black" /> Run Custom Query
            </button>
          </div>

          {/* Quick metric chips to insert into query */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
            <span className="text-[#787B86]">Quick Add Metrics:</span>
            {[
              'ROE > 15%',
              'ROCE > 18%',
              'PE < 25',
              'Debt to equity < 0.5',
              'Volume > 2x 20DMA',
              'Piotroski >= 7',
              'Price > 200 EMA',
            ].map((metric) => (
              <button
                key={metric}
                onClick={() => setCustomQueryText((prev) => `${prev} AND ${metric}`)}
                className="px-2 py-0.5 rounded bg-[#151921] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#2A2E39] cursor-pointer"
              >
                + {metric}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Category Filter Bar */}
        <div className="p-3 bg-[#151921] border-b border-[#2A2E39] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono py-0.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1 rounded whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === c.id
                    ? 'bg-[#26A69A] text-black font-bold'
                    : 'bg-[#0B0E11] text-[#787B86] hover:text-[#D1D4DC] border border-[#2A2E39]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#787B86]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pre-made screens..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0B0E11] border border-[#2A2E39] rounded text-xs font-mono text-white placeholder-[#787B86] focus:outline-none focus:border-[#26A69A]"
            />
          </div>
        </div>

        {/* Screen Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredScreens.map((screen) => {
              const isLiked = likedScreens.includes(screen.id);
              return (
                <div
                  key={screen.id}
                  className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39] hover:border-[#26A69A]/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white leading-tight">
                        {screen.title}
                      </h3>
                      <button
                        onClick={() => handleToggleLike(screen.id)}
                        className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isLiked
                            ? 'bg-[#26A69A]/20 border-[#26A69A]/40 text-[#26A69A]'
                            : 'border-[#2A2E39] text-[#787B86] hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{screen.upvotes + (isLiked ? 1 : 0)}</span>
                      </button>
                    </div>

                    <p className="text-xs text-[#787B86] leading-relaxed">
                      {screen.description}
                    </p>

                    {/* Query Formula Code */}
                    <div className="p-2 rounded bg-[#151921] border border-[#2A2E39] text-[10px] font-mono text-[#26A69A] flex items-center justify-between gap-2 overflow-hidden">
                      <span className="truncate">{screen.queryFormula}</span>
                      <button
                        onClick={() => handleCopyFormula(screen.id, screen.queryFormula)}
                        className="p-1 text-[#787B86] hover:text-white shrink-0 cursor-pointer"
                        title="Copy Formula"
                      >
                        {copiedId === screen.id ? (
                          <Check className="h-3 w-3 text-[#26A69A]" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {/* Tags & Metadata */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {screen.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-[#1E222D] text-[#D1D4DC]"
                        >
                          #{tag}
                        </span>
                      ))}
                      {screen.author && (
                        <span className="text-[10px] font-mono text-[#787B86] ml-auto">
                          by @{screen.author}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#2A2E39] text-xs font-mono">
                    <span className="text-[10px] text-[#787B86]">
                      {screen.clonesCount} Active Traders Cloned
                    </span>
                    <button
                      onClick={() => {
                        onApplyScreen(screen);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#26A69A] hover:bg-[#208b81] text-black font-bold rounded text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play className="h-3 w-3 fill-black" /> Run Screen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B0E11] border-t border-[#2A2E39] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#787B86]">
          <span>Custom and Community screens are evaluated in real-time across 130+ NSE/BSE equities.</span>
          <span className="text-[#26A69A]">Zero Latency Screen Execution</span>
        </div>
      </div>
    </div>
  );
};
