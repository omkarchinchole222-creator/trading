import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ScannedStock } from '../types';

export type QuickListType = 'gainers' | 'losers' | 'most-active' | '52w-high' | '52w-low';
export type QuickCapType = 'all' | 'large' | 'mid' | 'small';

interface QuickListsBarProps {
  stocks: ScannedStock[];
  onSelectStock: (stock: ScannedStock) => void;
  onAnalyzeStockAI?: (stock: ScannedStock) => void;
}

export const QuickListsBar: React.FC<QuickListsBarProps> = ({
  stocks,
  onSelectStock,
  onAnalyzeStockAI,
}) => {
  const [activeList, setActiveList] = useState<QuickListType>('gainers');
  const [activeCap, setActiveCap] = useState<QuickCapType>('all');

  const filteredAndSortedStocks = useMemo(() => {
    let pool = [...stocks];

    // Filter by cap
    if (activeCap === 'large') {
      pool = pool.filter((s) => s.currentPrice >= 3000 || s.symbol === 'RELIANCE' || s.symbol === 'TCS' || s.symbol === 'HDFCBANK');
    } else if (activeCap === 'mid') {
      pool = pool.filter((s) => s.currentPrice >= 1000 && s.currentPrice < 3000);
    } else if (activeCap === 'small') {
      pool = pool.filter((s) => s.currentPrice < 1000);
    }

    // Sort by type
    if (activeList === 'gainers') {
      return pool.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
    } else if (activeList === 'losers') {
      return pool.sort((a, b) => a.priceChangePercent - b.priceChangePercent);
    } else if (activeList === 'most-active') {
      return pool.sort((a, b) => b.volumeSpikeRatio - a.volumeSpikeRatio);
    } else if (activeList === '52w-high') {
      return pool.sort((a, b) => {
        const distA = Math.abs(a.currentPrice - a.high52Week) / (a.high52Week || 1);
        const distB = Math.abs(b.currentPrice - b.high52Week) / (b.high52Week || 1);
        return distA - distB;
      });
    } else if (activeList === '52w-low') {
      return pool.sort((a, b) => {
        const distA = Math.abs(a.currentPrice - a.low52Week) / (a.low52Week || 1);
        const distB = Math.abs(b.currentPrice - b.low52Week) / (b.low52Week || 1);
        return distA - distB;
      });
    }

    return pool;
  }, [stocks, activeList, activeCap]);

  const listTabs = [
    { id: 'gainers', label: 'Top Gainers', icon: TrendingUp, color: 'text-[#26A69A]' },
    { id: 'losers', label: 'Top Losers', icon: TrendingDown, color: 'text-[#EF5350]' },
    { id: 'most-active', label: 'Most Active (Volume Spike)', icon: Activity, color: 'text-[#4BA2FF]' },
    { id: '52w-high', label: '52-Week High Proximity', icon: ArrowUpRight, color: 'text-[#26A69A]' },
    { id: '52w-low', label: '52-Week Low Bounce', icon: ArrowDownRight, color: 'text-[#FF9800]' },
  ];

  const capTabs = [
    { id: 'all', label: 'All Equities' },
    { id: 'large', label: 'Large Cap' },
    { id: 'mid', label: 'Mid Cap' },
    { id: 'small', label: 'Small Cap' },
  ];

  return (
    <div className="bg-[#151921] border border-[#2A2E39] rounded-lg p-3 sm:p-4 space-y-3 font-sans">
      {/* Top Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Quick List Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono py-0.5">
          {listTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeList === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveList(tab.id as QuickListType)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B0E11] text-white border border-[#2A2E39] shadow-sm'
                    : 'text-[#787B86] hover:text-[#D1D4DC]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Market Cap Filter Pills */}
        <div className="flex items-center gap-1 bg-[#0B0E11] p-1 rounded border border-[#2A2E39] text-[11px] font-mono shrink-0">
          {capTabs.map((cap) => (
            <button
              key={cap.id}
              onClick={() => setActiveCap(cap.id as QuickCapType)}
              className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                activeCap === cap.id
                  ? 'bg-[#26A69A] text-black font-bold'
                  : 'text-[#787B86] hover:text-[#D1D4DC]'
              }`}
            >
              {cap.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scrolling Stock Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 overflow-x-auto pb-1">
        {filteredAndSortedStocks.slice(0, 12).map((stk) => {
          const isUp = stk.priceChangePercent >= 0;
          return (
            <div
              key={stk.symbol}
              onClick={() => onSelectStock(stk)}
              className="bg-[#0B0E11] p-2.5 rounded border border-[#2A2E39] hover:border-[#26A69A]/60 transition-all cursor-pointer flex flex-col justify-between space-y-1.5 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-white text-xs group-hover:text-[#26A69A] transition-colors">
                    {stk.symbol}
                  </div>
                  <div className="text-[9.5px] font-mono text-[#787B86] truncate max-w-[85px]">
                    {stk.sector}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isUp ? 'text-[#26A69A] bg-[#26A69A]/15' : 'text-[#EF5350] bg-[#EF5350]/15'
                  }`}
                >
                  {isUp ? '+' : ''}{stk.priceChangePercent.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1 border-t border-[#2A2E39]/60 text-xs font-mono">
                <span className="font-bold text-white">₹{stk.currentPrice}</span>
                <span className="text-[10px] text-[#787B86]">
                  {stk.volumeSpikeRatio.toFixed(1)}x Vol
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
