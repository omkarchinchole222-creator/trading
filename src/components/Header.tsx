import React, { useEffect, useState } from 'react';
import {
  Terminal,
  Sparkles,
  RefreshCw,
  Code2,
  Layers,
  Gauge,
  BookOpen,
  Newspaper,
  PieChart,
  MessageSquare,
  BarChart4,
} from 'lucide-react';

interface HeaderProps {
  onRunScan: () => void;
  onOpenPayloadModal: () => void;
  onOpenPythonModal: () => void;
  onAnalyzeAI: () => void;
  onOpenMarketMoodModal: () => void;
  onOpenExploreScreensModal: () => void;
  onOpenNewsModal: () => void;
  onOpenPortfolioModal: () => void;
  onOpenAskStockModal: () => void;
  onOpenStockChartsStudio: () => void;
  isScanning: boolean;
  isAnalyzing: boolean;
  totalStocksCount: number;
  highScoreCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRunScan,
  onOpenPayloadModal,
  onOpenPythonModal,
  onAnalyzeAI,
  onOpenMarketMoodModal,
  onOpenExploreScreensModal,
  onOpenNewsModal,
  onOpenPortfolioModal,
  onOpenAskStockModal,
  onOpenStockChartsStudio,
  isScanning,
  isAnalyzing,
  totalStocksCount,
  highScoreCount,
}) => {
  const [istTime, setIstTime] = useState<string>('');
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Calculate IST (UTC + 5:30)
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utcTime + 3600000 * 5.5);

      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const seconds = istDate.getSeconds();
      const day = istDate.getDay();

      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} IST`;
      setIstTime(timeStr);

      // Market is open Mon-Fri (1-5) between 09:15 and 15:30 IST
      const totalMinutes = hours * 60 + minutes;
      const open = day >= 1 && day <= 5 && totalMinutes >= 9 * 60 + 15 && totalMinutes <= 15 * 60 + 30;
      setIsMarketOpen(open);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-[#2A2E39] px-3 sm:px-5 flex items-center justify-between bg-[#151921] sticky top-0 z-30 select-none">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#26A69A] flex items-center justify-center font-bold text-black text-xs rounded-xs">
            S
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
              SCANNER.PRO
            </span>
            <span className="hidden xl:inline-block text-[9.5px] uppercase tracking-widest text-[#787B86] font-mono">
              NSE/BSE TERMINAL
            </span>
          </div>
        </div>

        {/* Feature Tools Shortcuts */}
        <div className="hidden lg:flex items-center gap-1 font-mono text-[11px]">
          <button
            onClick={onOpenMarketMoodModal}
            className="px-2 py-1 rounded bg-[#0B0E11] hover:bg-[#2A2E39] text-[#D1D4DC] hover:text-white border border-[#2A2E39] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Market Mood Index (Tickertape)"
          >
            <Gauge className="h-3.5 w-3.5 text-[#26A69A]" />
            <span>Mood Index (64)</span>
          </button>

          <button
            onClick={onOpenExploreScreensModal}
            className="px-2 py-1 rounded bg-[#0B0E11] hover:bg-[#2A2E39] text-[#D1D4DC] hover:text-white border border-[#2A2E39] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Explore Formula Screens & Custom SQL (Screener.in)"
          >
            <BookOpen className="h-3.5 w-3.5 text-[#4BA2FF]" />
            <span>Explore Screens</span>
          </button>

          <button
            onClick={onOpenNewsModal}
            className="px-2 py-1 rounded bg-[#0B0E11] hover:bg-[#2A2E39] text-[#D1D4DC] hover:text-white border border-[#2A2E39] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Verified Live News Feed & Spotlights"
          >
            <Newspaper className="h-3.5 w-3.5 text-[#FF9800]" />
            <span>News Feed</span>
          </button>

          <button
            onClick={onOpenPortfolioModal}
            className="px-2 py-1 rounded bg-[#0B0E11] hover:bg-[#2A2E39] text-[#D1D4DC] hover:text-white border border-[#2A2E39] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Portfolio Risk Audit & Calculators (StockAnalyzer AI)"
          >
            <PieChart className="h-3.5 w-3.5 text-[#AB47BC]" />
            <span>Portfolio Audit</span>
          </button>

          <button
            onClick={onOpenStockChartsStudio}
            className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors font-bold"
            title="StockCharts.com Studio (SCTR, RRG, PerfChart, Seasonality, CandleGlance, Carpet, Alerts, Workbench)"
          >
            <BarChart4 className="h-3.5 w-3.5 text-amber-400" />
            <span>StockCharts Studio</span>
          </button>

          <button
            onClick={onOpenAskStockModal}
            className="px-2.5 py-1 rounded bg-[#26A69A]/15 hover:bg-[#26A69A]/25 text-[#26A69A] border border-[#26A69A]/40 flex items-center gap-1.5 cursor-pointer transition-colors font-bold"
            title="Ask Anything About Any Stock (Incite AI)"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          id="header-ask-mobile-btn"
          onClick={onOpenAskStockModal}
          className="lg:hidden p-1.5 bg-[#26A69A]/20 text-[#26A69A] rounded border border-[#26A69A]/30 cursor-pointer"
          title="Ask AI"
        >
          <MessageSquare className="h-4 w-4" />
        </button>

        <button
          id="header-python-btn"
          onClick={onOpenPythonModal}
          className="hidden sm:flex px-2 sm:px-2.5 py-1.5 bg-[#2A2E39] text-[#D1D4DC] text-[10px] uppercase font-bold tracking-widest rounded hover:bg-[#363A45] hover:text-white transition-colors cursor-pointer items-center gap-1.5"
          title="Python / Colab Script"
        >
          <Code2 className="h-3 w-3 text-[#26A69A]" />
          <span>Python</span>
        </button>

        <button
          id="header-import-payload-btn"
          onClick={onOpenPayloadModal}
          className="hidden sm:flex px-2 sm:px-2.5 py-1.5 bg-[#2A2E39] text-[#D1D4DC] text-[10px] uppercase font-bold tracking-widest rounded hover:bg-[#363A45] hover:text-white transition-colors cursor-pointer items-center gap-1.5"
          title="Paste output payload from Python / Colab"
        >
          <Terminal className="h-3 w-3 text-[#787B86]" />
          <span>Payload</span>
        </button>

        <button
          id="header-run-scan-btn"
          onClick={onRunScan}
          disabled={isScanning}
          className="px-2.5 sm:px-3 py-1.5 bg-[#2A2E39] text-[#D1D4DC] text-[10px] uppercase font-bold tracking-widest rounded hover:bg-[#363A45] hover:text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 border border-[#2A2E39]"
        >
          <RefreshCw className={`h-3 w-3 text-[#26A69A] ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
        </button>

        <button
          id="header-ai-analyze-btn"
          onClick={onAnalyzeAI}
          disabled={isAnalyzing || totalStocksCount === 0}
          className="px-3 sm:px-3.5 py-1.5 bg-[#26A69A] text-black text-[10px] uppercase font-bold tracking-widest rounded hover:bg-[#34b7ab] disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className={`h-3 w-3 ${isAnalyzing ? 'animate-pulse' : ''}`} />
          <span>{isAnalyzing ? 'Analyzing...' : 'AI Buying Sheet'}</span>
        </button>
      </div>
    </header>
  );
};


