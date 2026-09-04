import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ScannedStock, StockDeepDiveAnalysis } from '../types';
import { BrokerCandlestickChart } from './BrokerCandlestickChart';

interface StockDetailModalProps {
  stock: ScannedStock | null;
  onClose: () => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [activeTab, setActiveTab] = useState<'chart' | 'calculator' | 'ai-deepdive'>('chart');
  const [accountCapital, setAccountCapital] = useState<number>(500000); // 5 Lakhs
  const [riskPercent, setRiskPercent] = useState<number>(1.5); // 1.5%
  const [customStopLoss, setCustomStopLoss] = useState<number>(0);
  const [deepDiveData, setDeepDiveData] = useState<StockDeepDiveAnalysis | null>(null);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState<boolean>(false);
  const [deepDiveError, setDeepDiveError] = useState<string | null>(null);

  useEffect(() => {
    if (stock) {
      // Default stop loss 2% below 20 EMA or 3% below price
      const sl = stock.aboveEma20 ? Math.round(stock.ema20 * 0.98 * 10) / 10 : Math.round(stock.currentPrice * 0.96 * 10) / 10;
      setCustomStopLoss(sl);
      setDeepDiveData(null);
    }
  }, [stock]);

  if (!stock) return null;

  // Prepare chart series from history
  const chartData = (stock.history || []).map((candle) => ({
    date: candle.date.slice(5), // MM-DD
    price: candle.close,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    volume: candle.volume,
  }));

  // Position Sizing Calculations
  const riskAmount = (accountCapital * riskPercent) / 100;
  const perShareRisk = Math.max(0.5, stock.currentPrice - customStopLoss);
  const calculatedQty = Math.floor(riskAmount / perShareRisk);
  const totalInvestment = calculatedQty * stock.currentPrice;
  const isOverLeveraged = totalInvestment > accountCapital;

  // Potential returns
  const target1Price = Math.round(stock.currentPrice * 1.05 * 10) / 10;
  const target2Price = Math.round(stock.currentPrice * 1.10 * 10) / 10;
  const profitT1 = calculatedQty * (target1Price - stock.currentPrice);
  const profitT2 = calculatedQty * (target2Price - stock.currentPrice);

  const fetchAIDeepDive = async () => {
    setIsLoadingDeepDive(true);
    setDeepDiveError(null);
    try {
      const res = await fetch('/api/gemini/stock-deepdive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate AI deep dive');
      }
      const data = await res.json();
      setDeepDiveData(data);
    } catch (err: any) {
      setDeepDiveError(err.message || 'Error communicating with Gemini');
    } finally {
      setIsLoadingDeepDive(false);
    }
  };

  const isPositive = stock.priceChangePercent >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#151921] border border-[#2A2E39] rounded w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#151921] border-b border-[#2A2E39] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-[#0B0E11] border border-[#2A2E39] flex items-center justify-center font-bold text-white font-mono text-sm">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono">{stock.symbol}</h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#787B86] bg-[#0B0E11] border border-[#2A2E39]">
                  NSE:{stock.symbol}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#26A69A]/15 text-[#26A69A] border border-[#26A69A]/30">
                  Score: {stock.score}/100
                </span>
              </div>
              <p className="text-xs text-[#787B86]">
                {stock.name} • <span className="text-[#26A69A] font-mono">{stock.sector}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-base sm:text-lg font-bold text-white font-mono">
                ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div
                className={`text-xs font-mono font-semibold flex items-center justify-end gap-0.5 ${
                  isPositive ? 'text-[#26A69A]' : 'text-[#EF5350]'
                }`}
              >
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}
                {stock.priceChangePercent}% (₹{stock.priceChange})
              </div>
            </div>

            <button
              id="close-stock-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-[#2A2E39] bg-[#0B0E11] flex items-center gap-4 text-xs font-mono font-semibold">
          <button
            onClick={() => setActiveTab('chart')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] ${
              activeTab === 'chart'
                ? 'border-[#26A69A] text-[#26A69A]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Technical Chart
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] ${
              activeTab === 'calculator'
                ? 'border-[#26A69A] text-[#26A69A]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" /> Risk Sizer
          </button>

          <button
            onClick={() => {
              setActiveTab('ai-deepdive');
              if (!deepDiveData && !isLoadingDeepDive) {
                fetchAIDeepDive();
              }
            }}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-[11px] ${
              activeTab === 'ai-deepdive'
                ? 'border-[#26A69A] text-[#26A69A]'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#26A69A]" /> Gemini AI Analysis
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CHART & INDICATORS */}
          {activeTab === 'chart' && (
            <div className="space-y-4">
              {/* Technical Indicator Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">RSI (14 Period)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{stock.rsi14}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#26A69A]/15 text-[#26A69A] border border-[#26A69A]/30">
                      {stock.rsi14 >= 40 && stock.rsi14 <= 65 ? 'Bullish' : 'Neutral'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">20 EMA / 50 EMA</span>
                  <div className="font-bold text-white text-xs">
                    ₹{stock.ema20} / ₹{stock.ema50}
                  </div>
                  <span className="text-[10px] text-[#26A69A] mt-0.5 block">
                    {stock.aboveEma20 ? 'Above 20 EMA ✓' : 'Below 20 EMA'}
                  </span>
                </div>

                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">Vol Ratio (20-DMA)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#26A69A]">
                      {stock.volumeSpikeRatio}x
                    </span>
                    <span className="text-[10px] text-[#787B86]">
                      ({(stock.volume / 100000).toFixed(1)}L)
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">52W Range</span>
                  <div className="font-semibold text-white text-xs">
                    ₹{stock.low52Week} - ₹{stock.high52Week}
                  </div>
                  <span className="text-[9px] text-[#787B86]">6mo Extrapolated</span>
                </div>
              </div>

              {/* Broker Candlestick Chart with Overlays & Timeframe */}
              <BrokerCandlestickChart
                symbol={stock.symbol}
                candles={stock.history}
                entryPrice={stock.currentPrice}
                stopLossPrice={customStopLoss}
                target1Price={target1Price}
                target2Price={target2Price}
                patternName={stock.detectedPatterns?.[0] || stock.setupType}
                height={340}
              />

              {/* Detected Patterns list */}
              <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#787B86] block mb-2">
                  Key Technical Setup Reasons:
                </span>
                <div className="flex flex-wrap gap-2">
                  {stock.scoringReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#151921] text-[#26A69A] border border-[#2A2E39] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 text-[#26A69A]" />
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRADE & POSITION SIZER */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0E11] rounded border border-[#2A2E39]">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                  <Calculator className="h-3.5 w-3.5 text-[#26A69A]" /> Capital Allocation & Risk Position Sizer
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs font-mono">
                  <div>
                    <label className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">
                      Account Capital (₹):
                    </label>
                    <input
                      type="number"
                      value={accountCapital}
                      onChange={(e) => setAccountCapital(Math.max(1000, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono font-semibold focus:outline-none focus:border-[#26A69A]"
                    />
                  </div>

                  <div>
                    <label className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">
                      Risk Per Trade (%):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.2"
                      max="10"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono font-semibold focus:outline-none focus:border-[#26A69A]"
                    />
                  </div>

                  <div>
                    <label className="text-[#787B86] text-[10px] uppercase tracking-wider block mb-1">
                      Stop Loss Price (₹):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={customStopLoss}
                      onChange={(e) => setCustomStopLoss(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-[#EF5350] font-mono font-semibold focus:outline-none focus:border-[#EF5350]"
                    />
                  </div>
                </div>

                {/* Calculation Summary Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#151921] p-3 rounded border border-[#2A2E39] text-xs font-mono">
                  <div>
                    <span className="text-[#787B86] text-[10px] uppercase block">Max Risk (₹)</span>
                    <span className="text-sm font-bold text-[#EF5350]">
                      ₹{riskAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#787B86] text-[10px] uppercase block">Recommended Qty</span>
                    <span className="text-sm font-bold text-[#26A69A]">
                      {calculatedQty} Shares
                    </span>
                  </div>

                  <div>
                    <span className="text-[#787B86] text-[10px] uppercase block">Total Investment</span>
                    <span className="text-sm font-bold text-white">
                      ₹{totalInvestment.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#787B86] text-[10px] uppercase block">Capital Utilization</span>
                    <span
                      className={`text-sm font-bold ${
                        isOverLeveraged ? 'text-[#EF5350]' : 'text-[#26A69A]'
                      }`}
                    >
                      {((totalInvestment / accountCapital) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {isOverLeveraged && (
                  <div className="mt-3 p-2.5 rounded bg-[#EF5350]/10 border border-[#EF5350]/30 text-[#EF5350] text-xs flex items-center gap-2 font-mono">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      Warning: Required position size exceeds total available capital. Lower risk % or quantity.
                    </span>
                  </div>
                )}
              </div>

              {/* Profit Target Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="text-[#787B86] text-[10px] uppercase tracking-wider block">
                    Target 1 Milestone (+5%)
                  </span>
                  <div className="text-base font-bold text-white mt-1">₹{target1Price}</div>
                  <div className="text-[#26A69A] text-[11px] mt-0.5">
                    Potential Profit: +₹{profitT1.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3.5 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="text-[#787B86] text-[10px] uppercase tracking-wider block">
                    Target 2 Milestone (+10%)
                  </span>
                  <div className="text-base font-bold text-white mt-1">₹{target2Price}</div>
                  <div className="text-[#26A69A] text-[11px] mt-0.5">
                    Potential Profit: +₹{profitT2.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GEMINI AI DEEP DIVE */}
          {activeTab === 'ai-deepdive' && (
            <div className="space-y-4">
              {isLoadingDeepDive && (
                <div className="p-8 text-center text-[#787B86]">
                  <Sparkles className="h-6 w-6 text-[#26A69A] animate-spin mx-auto mb-2" />
                  <p className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                    Generating Gemini AI Institutional Technical Audit...
                  </p>
                  <p className="text-[11px] text-[#787B86] mt-1 font-mono">
                    Evaluating support, resistance, order flow, and candlestick confirmation.
                  </p>
                </div>
              )}

              {deepDiveError && (
                <div className="p-3 rounded bg-[#EF5350]/10 border border-[#EF5350]/30 text-[#EF5350] text-xs font-mono">
                  <p className="font-semibold">AI Analysis Failed</p>
                  <p>{deepDiveError}</p>
                  <button
                    onClick={fetchAIDeepDive}
                    className="mt-2 px-3 py-1 bg-[#2A2E39] hover:bg-[#363A45] text-white rounded cursor-pointer uppercase text-[10px] font-bold tracking-widest"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

              {deepDiveData && !isLoadingDeepDive && (
                <div className="space-y-3 text-xs">
                  {/* Verdict Banner */}
                  <div className="p-3.5 bg-[#0B0E11] rounded border border-[#2A2E39] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[#787B86] text-[10px] uppercase font-mono block">AI Tactical Verdict</span>
                      <div className="text-base font-extrabold text-[#26A69A] font-mono flex items-center gap-2">
                        {deepDiveData.verdict}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#151921] text-white border border-[#2A2E39]">
                          {deepDiveData.overallScore} / 100
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[#D1D4DC] font-mono text-[11px]">
                      <div>
                        <span className="text-[#787B86] text-[9px] uppercase block">Support</span>
                        <span className="font-semibold text-[#4BA2FF]">
                          {(deepDiveData.keySupportLevels || []).map((s) => `₹${s}`).join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#787B86] text-[9px] uppercase block">Resistance</span>
                        <span className="font-semibold text-[#EF5350]">
                          {(deepDiveData.keyResistanceLevels || []).map((r) => `₹${r}`).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trend & Volume Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                      <span className="font-bold text-[#D1D4DC] uppercase tracking-wider text-[10px] font-mono block mb-1">
                        Trend & Candlestick Interpretation
                      </span>
                      <p className="text-[#D1D4DC] leading-relaxed font-sans">
                        {deepDiveData.candlestickInterpretation}
                      </p>
                      <p className="text-[#787B86] mt-2 text-[11px] font-mono">
                        <strong>Structure:</strong> {deepDiveData.trendStructure}
                      </p>

                      {/* ASCII Candlestick Formation Diagram */}
                      {deepDiveData.asciiCandleDiagram && (
                        <div className="mt-3 p-2.5 bg-[#151921] rounded border border-[#2A2E39]">
                          <span className="text-[9px] uppercase font-mono text-[#26A69A] block mb-1 font-bold">
                            Candlestick Anatomy & Formation:
                          </span>
                          <pre className="font-mono text-[10px] text-[#26A69A] leading-tight overflow-x-auto whitespace-pre">
                            {deepDiveData.asciiCandleDiagram}
                          </pre>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                      <span className="font-bold text-[#D1D4DC] uppercase tracking-wider text-[10px] font-mono block mb-1">
                        Volume Profile & Order Flow
                      </span>
                      <p className="text-[#D1D4DC] leading-relaxed font-sans">
                        {deepDiveData.volumeAnalysis}
                      </p>
                      {deepDiveData.riskRewardAssessment && (
                        <p className="text-[#26A69A] mt-2 text-[11px] font-mono">
                          <strong>R:R Assessment:</strong> {deepDiveData.riskRewardAssessment}
                        </p>
                      )}

                      {/* Execution Ticket */}
                      {deepDiveData.executionTicket && (
                        <div className="mt-3 p-2.5 bg-[#151921] rounded border border-[#26A69A]/30 font-mono text-[11px] space-y-1">
                          <div className="text-[10px] font-bold uppercase text-[#26A69A] border-b border-[#2A2E39] pb-1">
                            Institutional Execution Ticket ({deepDiveData.executionTicket.orderType || 'Limit Entry'}):
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                            <div>
                              <span className="text-[#787B86]">Entry Range:</span>{' '}
                              <strong className="text-white">{deepDiveData.executionTicket.entryRange}</strong>
                            </div>
                            <div>
                              <span className="text-[#787B86]">Stop Loss:</span>{' '}
                              <strong className="text-[#EF5350]">₹{deepDiveData.executionTicket.stopLoss}</strong>
                            </div>
                            <div>
                              <span className="text-[#787B86]">Target 1:</span>{' '}
                              <strong className="text-[#26A69A]">₹{deepDiveData.executionTicket.target1}</strong>
                            </div>
                            <div>
                              <span className="text-[#787B86]">Target 2:</span>{' '}
                              <strong className="text-[#26A69A]">₹{deepDiveData.executionTicket.target2}</strong>
                            </div>
                          </div>
                          <div className="text-[10px] text-[#787B86] pt-1">
                            Min Risk-to-Reward: <strong className="text-[#26A69A]">{deepDiveData.executionTicket.riskRewardRatio || '1:2.5'}</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div className="p-3 bg-[#151921] rounded border border-[#26A69A]/30">
                    <span className="font-bold text-[#26A69A] uppercase tracking-wider text-[10px] font-mono block mb-1">
                      Tactical Action Plan
                    </span>
                    <p className="text-[#D1D4DC] leading-relaxed font-sans">
                      {deepDiveData.suggestedActionPlan}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

