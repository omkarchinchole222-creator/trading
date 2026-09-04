/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ScannerControls } from './components/ScannerControls';
import { ScannerResultsTable } from './components/ScannerResultsTable';
import { AIOpportunitySheet } from './components/AIOpportunitySheet';
import { StockDetailModal } from './components/StockDetailModal';
import { PayloadModal } from './components/PayloadModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { MarketMoodModal } from './components/MarketMoodModal';
import { ExploreScreensLibrary, PreMadeScreen } from './components/ExploreScreensLibrary';
import { LiveNewsModal } from './components/LiveNewsModal';
import { PortfolioRiskModal } from './components/PortfolioRiskModal';
import { AskStockChatModal } from './components/AskStockChatModal';
import { StockChartsStudioModal } from './components/StockChartsStudioModal';
import { QuickListsBar } from './components/QuickListsBar';
import {
  ScannedStock,
  ScanFilterOptions,
  AIAnalysisResponse,
  TradingStyleProfile,
  AnalysisSegmentToggles,
} from './types';
import { getSymbolsForIndex, findStockInfo } from './data/symbols';
import {
  Sparkles,
  TrendingUp,
  Table,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Gauge,
  BookOpen,
  Newspaper,
  PieChart,
  MessageSquare,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'screener' | 'ai-sheet'>('screener');
  const [scannedStocks, setScannedStocks] = useState<ScannedStock[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Selected symbols for batch actions
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  // AI Opportunity state
  const [analysisData, setAnalysisData] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Modals state
  const [selectedStockForModal, setSelectedStockForModal] = useState<ScannedStock | null>(null);
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState<boolean>(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [isMarketMoodOpen, setIsMarketMoodOpen] = useState<boolean>(false);
  const [isExploreScreensOpen, setIsExploreScreensOpen] = useState<boolean>(false);
  const [isNewsOpen, setIsNewsOpen] = useState<boolean>(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [isAskStockOpen, setIsAskStockOpen] = useState<boolean>(false);
  const [isStockChartsOpen, setIsStockChartsOpen] = useState<boolean>(false);
  const [askStockTarget, setAskStockTarget] = useState<ScannedStock | null>(null);

  // Filter state
  const [activePreset, setActivePreset] = useState<string>('high-score');
  const [filterOptions, setFilterOptions] = useState<ScanFilterOptions>({
    index: 'NIFTY50',
    exchange: 'ALL',
    customTickers: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ZOMATO', 'DIXON', 'HAL'],
    filterLogic: 'AND',
    minPrice: 0,
    maxPrice: 100000,
    marketCap: 'all',
    minScore: 50,
    rsiMin: 35,
    rsiMax: 75,
    volumeRatioMin: 1.0,
    minAvgVolume: 0,
    unusualVolumeOnly: false,
    mustBeAboveEma20: false,
    mustBeAboveEma50: false,
    mustBeAboveEma200: false,
    patternsRequired: [],
    breakoutStatus: 'all',
    trendDirection: 'all',
    profitableOnly: false,
    hasVerifiedNewsOnly: false,
  });

  // Handle Preset Strategy Selection
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    if (presetId === 'all') {
      setFilterOptions((prev) => ({
        ...prev,
        minScore: 0,
        rsiMin: 0,
        rsiMax: 100,
        volumeRatioMin: 0.5,
        marketCap: 'all',
        breakoutStatus: 'all',
        trendDirection: 'all',
        profitableOnly: false,
        hasVerifiedNewsOnly: false,
        mustBeAboveEma20: false,
        mustBeAboveEma50: false,
        mustBeAboveEma200: false,
      }));
    } else if (presetId === 'high-score') {
      setFilterOptions((prev) => ({
        ...prev,
        minScore: 65,
        rsiMin: 35,
        rsiMax: 75,
        volumeRatioMin: 1.0,
        mustBeAboveEma20: false,
        mustBeAboveEma50: false,
        mustBeAboveEma200: false,
      }));
    } else if (presetId === 'golden-ema') {
      setFilterOptions((prev) => ({
        ...prev,
        minScore: 50,
        mustBeAboveEma20: true,
        mustBeAboveEma50: true,
        mustBeAboveEma200: true,
        trendDirection: 'uptrend',
        volumeRatioMin: 1.0,
      }));
    } else if (presetId === 'vol-breakout') {
      setFilterOptions((prev) => ({
        ...prev,
        minScore: 60,
        volumeRatioMin: 1.5,
        breakoutStatus: 'confirmed',
        rsiMin: 35,
        rsiMax: 80,
      }));
    } else if (presetId === 'penny-momentum') {
      setFilterOptions((prev) => ({
        ...prev,
        maxPrice: 300,
        marketCap: 'penny',
        volumeRatioMin: 1.8,
        minScore: 55,
      }));
    } else if (presetId === 'blue-chip-value') {
      setFilterOptions((prev) => ({
        ...prev,
        index: 'NIFTY50',
        marketCap: 'large',
        profitableOnly: true,
        maxPe: 35,
        mustBeAboveEma200: true,
        minScore: 60,
      }));
    } else if (presetId === 'oversold-reversal') {
      setFilterOptions((prev) => ({
        ...prev,
        minScore: 50,
        rsiMin: 28,
        rsiMax: 48,
      }));
    }
  };

  // Run market scan
  const executeScan = async () => {
    setIsScanning(true);
    setScanError(null);

    let symbolsToScan: string[] = [];
    if (filterOptions.index === 'CUSTOM') {
      symbolsToScan = filterOptions.customTickers || ['RELIANCE', 'TCS', 'HDFCBANK'];
    } else {
      symbolsToScan = getSymbolsForIndex(filterOptions.index);
    }

    try {
      const response = await fetch('/api/market-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: symbolsToScan }),
      });

      if (!response.ok) {
        throw new Error(`Scan failed with status ${response.status}`);
      }

      const data = await response.json();
      setScannedStocks(data.stocks || []);

      // Auto-select high scoring stocks
      const highScores = (data.stocks || []).filter((s: ScannedStock) => s.score >= 70).map((s: ScannedStock) => s.symbol);
      setSelectedSymbols(highScores.slice(0, 10));
    } catch (err: any) {
      setScanError(err.message || 'Failed to scan market equities');
    } finally {
      setIsScanning(false);
    }
  };

  // Run scan once on mount
  useEffect(() => {
    executeScan();
  }, [filterOptions.index]);

  // Apply filters to scanned stocks for table rendering
  const filteredStocks = useMemo(() => {
    return scannedStocks.filter((stock) => {
      const passesPrice =
        (!filterOptions.minPrice || stock.currentPrice >= filterOptions.minPrice) &&
        (!filterOptions.maxPrice || stock.currentPrice <= filterOptions.maxPrice);

      const passesScore = stock.score >= filterOptions.minScore;
      const passesRsi = stock.rsi14 >= filterOptions.rsiMin && stock.rsi14 <= filterOptions.rsiMax;
      const passesVol = stock.volumeSpikeRatio >= filterOptions.volumeRatioMin;

      const passesEma20 = !filterOptions.mustBeAboveEma20 || stock.aboveEma20;
      const passesEma50 = !filterOptions.mustBeAboveEma50 || stock.aboveEma50;
      const passesEma200 = !filterOptions.mustBeAboveEma200 || stock.aboveEma200;

      // Market Cap Category Filter (Approximated by price or index tier)
      let passesMarketCap = true;
      if (filterOptions.marketCap === 'penny') {
        passesMarketCap = stock.currentPrice < 100;
      } else if (filterOptions.marketCap === 'micro') {
        passesMarketCap = stock.currentPrice >= 100 && stock.currentPrice < 500;
      } else if (filterOptions.marketCap === 'small') {
        passesMarketCap = stock.currentPrice >= 500 && stock.currentPrice < 1500;
      } else if (filterOptions.marketCap === 'mid') {
        passesMarketCap = stock.currentPrice >= 1500 && stock.currentPrice < 4000;
      } else if (filterOptions.marketCap === 'large') {
        passesMarketCap = stock.currentPrice >= 4000 || stock.symbol === 'RELIANCE' || stock.symbol === 'TCS' || stock.symbol === 'HDFCBANK';
      }

      // Candlestick Pattern Requirements
      let passesPatterns = true;
      if (filterOptions.patternsRequired && filterOptions.patternsRequired.length > 0) {
        passesPatterns = filterOptions.patternsRequired.some((req) =>
          stock.patterns.some((p) => p.toLowerCase().includes(req.toLowerCase()))
        );
      }

      // Breakout Verification Flag
      let passesBreakout = true;
      if (filterOptions.breakoutStatus === 'confirmed') {
        passesBreakout = stock.volumeSpikeRatio >= 1.5 && stock.aboveEma20;
      } else if (filterOptions.breakoutStatus === 'unconfirmed') {
        passesBreakout = stock.volumeSpikeRatio >= 1.5 && !stock.aboveEma20;
      }

      if (filterOptions.filterLogic === 'OR') {
        return passesPrice || passesScore || passesRsi || passesVol || passesPatterns;
      }

      return (
        passesPrice &&
        passesScore &&
        passesRsi &&
        passesVol &&
        passesEma20 &&
        passesEma50 &&
        passesEma200 &&
        passesMarketCap &&
        passesPatterns &&
        passesBreakout
      );
    });
  }, [scannedStocks, filterOptions, activePreset]);

  // Trigger Gemini AI Opportunity Generation
  const handleAnalyzeAI = async (
    style: TradingStyleProfile = 'swing',
    risk = 'Balanced',
    segments: AnalysisSegmentToggles = {
      candlestick: true,
      volume: true,
      technical: true,
      historical: true,
      fundamentals: true,
      news: true,
      sector_context: true,
    }
  ) => {
    setIsAnalyzing(true);
    setActiveTab('ai-sheet');

    // Pick selected stocks or top filtered stocks
    let candidates = scannedStocks.filter((s) => selectedSymbols.includes(s.symbol));
    if (candidates.length === 0) {
      candidates = filteredStocks.slice(0, 15);
    }
    if (candidates.length === 0) {
      candidates = scannedStocks.slice(0, 15);
    }

    try {
      const response = await fetch('/api/gemini/analyze-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scannedStocks: candidates,
          tradingStyle: style,
          riskAppetite: risk,
          enabledSegments: segments,
          filtersApplied: {
            universe: filterOptions.index,
            marketCap: filterOptions.marketCap,
            minScore: filterOptions.minScore,
            volumeThreshold: `${filterOptions.volumeRatioMin}x`,
            breakoutStatus: filterOptions.breakoutStatus,
            logic: filterOptions.filterLogic,
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to analyze with Gemini');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error('AI Opportunity Generation Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Custom ticker handlers
  const handleAddCustomTicker = (ticker: string) => {
    const current = filterOptions.customTickers || [];
    if (!current.includes(ticker)) {
      setFilterOptions({
        ...filterOptions,
        customTickers: [...current, ticker],
      });
    }
  };

  const handleRemoveCustomTicker = (ticker: string) => {
    const current = filterOptions.customTickers || [];
    setFilterOptions({
      ...filterOptions,
      customTickers: current.filter((t) => t !== ticker),
    });
  };

  // Selection handlers
  const toggleSelectSymbol = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const selectAll = () => {
    setSelectedSymbols(filteredStocks.map((s) => s.symbol));
  };

  const deselectAll = () => {
    setSelectedSymbols([]);
  };

  // Import payload handler
  const handleImportStocks = (stocks: ScannedStock[], autoRunAI: boolean) => {
    setScannedStocks(stocks);
    setSelectedSymbols(stocks.map((s) => s.symbol));
    if (autoRunAI) {
      setTimeout(() => {
        handleAnalyzeAI();
      }, 100);
    }
  };

  // Handle Explore Screen Application
  const handleApplyExploreScreen = (screen: PreMadeScreen) => {
    setIsExploreScreensOpen(false);
    setActiveTab('screener');
    setFilterOptions((prev) => ({
      ...prev,
      ...screen.filters,
    }));
    // Execute scan with applied filter parameters
    setTimeout(() => {
      executeScan();
    }, 100);
  };

  const handleStockClickFromModal = (symbol: string) => {
    const match = scannedStocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (match) {
      setSelectedStockForModal(match);
    } else {
      // Find info from symbols dataset
      const info = findStockInfo(symbol);
      const tempStock: ScannedStock = {
        symbol: symbol.toUpperCase(),
        ticker: `NSE:${symbol.toUpperCase()}`,
        name: info?.name || symbol,
        exchange: 'NSE',
        sector: info?.sector || 'Equities',
        currentPrice: 1500,
        priceChange: 15,
        priceChangePercent: 1.0,
        high52Week: 1650,
        low52Week: 1100,
        volume: 1000000,
        avgVolume20: 800000,
        volumeSpikeRatio: 1.25,
        rsi14: 55,
        prevRsi14: 52,
        ema20: 1480,
        ema50: 1440,
        ema200: 1350,
        aboveEma20: true,
        aboveEma50: true,
        aboveEma200: true,
        patterns: ['Bullish Engulfing', 'EMA Golden Alignment'],
        score: 75,
        scoringReasons: ['Strong EMA alignment with healthy volume expansion'],
        history: [],
      };
      setSelectedStockForModal(tempStock);
    }
  };

  const highScoreCount = scannedStocks.filter((s) => s.score >= 70).length;

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#D1D4DC] flex flex-col font-sans selection:bg-[#26A69A] selection:text-black">
      {/* Navigation Header */}
      <Header
        onRunScan={executeScan}
        onOpenPayloadModal={() => setIsPayloadModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onAnalyzeAI={() => handleAnalyzeAI()}
        onOpenMarketMoodModal={() => setIsMarketMoodOpen(true)}
        onOpenExploreScreensModal={() => setIsExploreScreensOpen(true)}
        onOpenNewsModal={() => setIsNewsOpen(true)}
        onOpenPortfolioModal={() => setIsPortfolioOpen(true)}
        onOpenAskStockModal={() => {
          setAskStockTarget(null);
          setIsAskStockOpen(true);
        }}
        onOpenStockChartsStudio={() => setIsStockChartsOpen(true)}
        isScanning={isScanning}
        isAnalyzing={isAnalyzing}
        totalStocksCount={scannedStocks.length}
        highScoreCount={highScoreCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4">
        {/* Error notification banner if scan fails */}
        {scanError && (
          <div className="p-3 rounded bg-[#EF5350]/10 border border-[#EF5350]/30 text-[#EF5350] text-xs flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#EF5350]" />
              <span>{scanError}</span>
            </div>
            <button
              onClick={executeScan}
              className="px-3 py-1 bg-[#EF5350] hover:bg-[#d64542] text-white rounded font-bold uppercase text-[10px] tracking-wider cursor-pointer"
            >
              Retry Scan
            </button>
          </div>
        )}

        {/* Quick Lists Bar (Tickertape Gainers/Losers/Volume/52W Proximity) */}
        {scannedStocks.length > 0 && (
          <QuickListsBar
            stocks={scannedStocks}
            onSelectStock={(stk) => setSelectedStockForModal(stk)}
            onAnalyzeStockAI={(stk) => {
              setAskStockTarget(stk);
              setIsAskStockOpen(true);
            }}
          />
        )}

        {/* View Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] p-1.5 rounded border border-[#2A2E39]">
          <div className="flex items-center gap-1.5 font-mono">
            <button
              id="view-tab-screener"
              onClick={() => setActiveTab('screener')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'screener'
                  ? 'bg-[#0B0E11] text-[#26A69A] border border-[#26A69A]/30'
                  : 'text-[#787B86] hover:text-[#D1D4DC]'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Technical Screener Grid</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#2A2E39] text-[#D1D4DC] font-semibold">
                {filteredStocks.length}
              </span>
            </button>

            <button
              id="view-tab-ai-sheet"
              onClick={() => setActiveTab('ai-sheet')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'ai-sheet'
                  ? 'bg-[#26A69A] text-black font-extrabold shadow-sm'
                  : 'text-[#787B86] hover:text-[#D1D4DC]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Gemini AI Opportunity Buying Sheet</span>
              {analysisData && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${activeTab === 'ai-sheet' ? 'bg-black/20 text-black' : 'bg-[#26A69A]/20 text-[#26A69A]'}`}>
                  {analysisData.opportunities.length} Setups
                </span>
              )}
            </button>
          </div>

          {/* Quick Info bar */}
          <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-[#787B86] px-3">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#26A69A]" /> RSI 40-65 Accumulation
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4BA2FF]" /> Price &gt; 20 EMA &gt; 50 EMA
            </span>
          </div>
        </div>

        {/* TAB 1: TECHNICAL SCREENER */}
        {activeTab === 'screener' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <ScannerControls
              filterOptions={filterOptions}
              onChangeFilterOptions={setFilterOptions}
              activePreset={activePreset}
              onSelectPreset={handleSelectPreset}
              onRunScan={executeScan}
              isScanning={isScanning}
              onAddCustomTicker={handleAddCustomTicker}
              onRemoveCustomTicker={handleRemoveCustomTicker}
            />

            {/* Results Table */}
            <ScannerResultsTable
              stocks={filteredStocks}
              selectedSymbols={selectedSymbols}
              onToggleSelectSymbol={toggleSelectSymbol}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              onOpenStockModal={(stk) => setSelectedStockForModal(stk)}
              onAnalyzeStockAI={(stk) => {
                setAskStockTarget(stk);
                setIsAskStockOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: AI OPPORTUNITY SHEET */}
        {activeTab === 'ai-sheet' && (
          <AIOpportunitySheet
            analysisData={analysisData}
            isAnalyzing={isAnalyzing}
            onRefreshAI={(style, risk) => handleAnalyzeAI(style, risk)}
            onSelectStock={(sym) => {
              const match = scannedStocks.find((s) => s.symbol === sym);
              if (match) {
                setSelectedStockForModal(match);
              } else {
                handleStockClickFromModal(sym);
              }
            }}
          />
        )}
      </main>

      {/* Stock Interactive Chart & Position Calculator Modal */}
      {selectedStockForModal && (
        <StockDetailModal
          stock={selectedStockForModal}
          onClose={() => setSelectedStockForModal(null)}
        />
      )}

      {/* Market Mood Index Modal */}
      <MarketMoodModal
        isOpen={isMarketMoodOpen}
        onClose={() => setIsMarketMoodOpen(false)}
        onSelectStock={handleStockClickFromModal}
      />

      {/* Explore Screens Library Modal (Screener.in parity) */}
      <ExploreScreensLibrary
        isOpen={isExploreScreensOpen}
        onClose={() => setIsExploreScreensOpen(false)}
        onApplyScreen={handleApplyExploreScreen}
      />

      {/* Verified Live News Modal (Tickertape parity) */}
      <LiveNewsModal
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        onSelectStock={handleStockClickFromModal}
      />

      {/* Portfolio Risk Audit & Quiz Modal (StockAnalyzer AI parity) */}
      <PortfolioRiskModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        onSelectStock={handleStockClickFromModal}
      />

      {/* Conversational Ask Stock AI Modal (Incite AI parity) */}
      <AskStockChatModal
        isOpen={isAskStockOpen}
        onClose={() => {
          setIsAskStockOpen(false);
          setAskStockTarget(null);
        }}
        initialStock={askStockTarget}
        onSelectStock={handleStockClickFromModal}
      />

      {/* StockCharts Studio Suite (SCTR, RRG, PerfCharts, CandleGlance, Carpet, Seasonality, Workbench, Alerts, ChartSchool) */}
      <StockChartsStudioModal
        isOpen={isStockChartsOpen}
        onClose={() => setIsStockChartsOpen(false)}
        onSelectStock={handleStockClickFromModal}
      />

      {/* Python Payload Importer Modal */}
      <PayloadModal
        isOpen={isPayloadModalOpen}
        onClose={() => setIsPayloadModalOpen(false)}
        onImportStocks={handleImportStocks}
      />

      {/* Python / Colab Script Modal */}
      <PythonScriptModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        onOpenPayloadModal={() => setIsPayloadModalOpen(true)}
      />
    </div>
  );
}
