import React, { useState } from 'react';
import { X, Terminal, AlertCircle, Sparkles } from 'lucide-react';
import { ScannedStock } from '../types';
import { findStockInfo } from '../data/symbols';

interface PayloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStocks: (stocks: ScannedStock[], autoRunAI: boolean) => void;
}

export const PayloadModal: React.FC<PayloadModalProps> = ({ isOpen, onClose, onImportStocks }) => {
  const [payloadText, setPayloadText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    const sample = `Ticker Price (₹) Category Score RSI(14) Vol_Spike Pattern
ZOMATO.NS 272.40 Mid-Cap 100 68.20 3.10x Bullish Engulfing
SUZLON.NS 78.50 Penny / Micro-Cap 100 64.10 2.80x Bullish Hammer
IDEA.NS 8.85 Penny / Micro-Cap 95 58.40 2.45x Bullish Hammer
YESBANK.NS 23.40 Penny / Micro-Cap 95 56.70 1.95x Bullish Engulfing
BASILIC.NS 420.00 Mid-Cap 90 62.10 2.20x Bullish Hammer
RELIANCE.NS 2980.50 Large/High-Value 85 54.20 2.10x Standard Trend
TCS.NS 4215.00 Large/High-Value 80 48.60 1.65x Standard Trend
JPPOWER.NS 19.80 Penny / Micro-Cap 80 52.30 1.85x Bullish Hammer
GTLINFRA.NS 2.15 Penny / Micro-Cap 75 51.00 1.60x Standard Trend`;
    setPayloadText(sample);
    setErrorMsg(null);
  };

  const handleParseAndImport = (autoRunAI: boolean) => {
    setErrorMsg(null);
    const raw = payloadText.trim();
    if (!raw) {
      setErrorMsg('Please paste your Python screener output or CSV payload.');
      return;
    }

    try {
      let parsedList: ScannedStock[] = [];

      // Case 1: Try JSON
      if (raw.startsWith('[') || raw.startsWith('{')) {
        const json = JSON.parse(raw);
        const items = Array.isArray(json) ? json : [json];
        parsedList = items.map((item: any) => {
          const ticker = item.Ticker || item.ticker || item.Symbol || item.symbol || 'NSE:STOCK';
          const cleanSym = ticker.replace('NSE:', '').replace('BSE:', '').replace('.NS', '').replace('.BO', '');
          const meta = findStockInfo(cleanSym);
          const price = Number(item['Price (₹)'] || item.Price || item.Current_Price || item.LTP || item.price || item.currentPrice || 1000);
          const rsi = Number(item['RSI(14)'] || item.RSI_14 || item.RSI || item.rsi14 || 50);
          const volRatio = parseFloat(String(item.Vol_Spike || item.Volume_Spike_Ratio || item.Volume_Ratio || '1.0').replace('x', '')) || 1.0;
          const score = Number(item.Score || item.score || 70);

          let patterns: string[] = [];
          if (item.Pattern) {
            patterns = [item.Pattern];
          } else if (item.Patterns_Detected || item.patterns) {
            const rawP = item.Patterns_Detected || item.patterns;
            patterns = typeof rawP === 'string' ? rawP.replace(/[\[\]']/g, '').split(',').map((p: string) => p.trim()).filter(Boolean) : rawP;
          }

          const symUpper = cleanSym.toUpperCase();
          const isSME = symUpper === "BASILIC" || symUpper === "CELLECOR" || symUpper === "DRONE" || symUpper === "KORE";
          const isBE = symUpper === "JPPOWER" || symUpper === "GTLINFRA" || symUpper === "RPOWER";
          const series = isSME ? "SM" : (isBE ? "BE" : "EQ");

          return {
            symbol: symUpper,
            ticker: `NSE:${symUpper}`,
            isin: `INE${Math.abs(cleanSym.split("").reduce((a, b) => a + b.charCodeAt(0), 1000000000)).toString().padStart(9, "0")}`,
            series,
            name: meta.name,
            exchange: (ticker.includes('.BO') || ticker.startsWith('BSE:')) ? ('BSE' as const) : ('NSE' as const),
            sector: meta.sector,
            currentPrice: price,
            priceChange: 0,
            priceChangePercent: 0,
            high52Week: price * 1.15,
            low52Week: price * 0.85,
            volume: Math.round(1000000 * volRatio),
            avgVolume20: 1000000,
            volumeSpikeRatio: volRatio,
            rsi14: rsi,
            prevRsi14: rsi - 2,
            ema20: price * 0.98,
            ema50: price * 0.95,
            ema200: price * 0.88,
            aboveEma20: Boolean(item.Above_EMA20 ?? price > price * 0.98),
            aboveEma50: Boolean(item.Above_EMA50 ?? price > price * 0.95),
            aboveEma200: true,
            patterns: (patterns.length > 0 ? patterns : ['Standard Trend']) as any,
            score,
            scoringReasons: item.Reason ? [item.Reason] : [`${volRatio}x Vol Spike`, item.Pattern || 'Momentum Breakout'],
            dataQualityFlag: isSME ? "SME Emerge (SM)" : (isBE ? "Trade-to-Trade (BE)" : "Active (EQ)"),
          };
        });
      } else {
        // Case 2: Tabular pandas string format
        const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          throw new Error('Not enough rows in the pasted payload.');
        }

        const headerLine = lines[0].toLowerCase();
        const dataLines = headerLine.includes('ticker') || headerLine.includes('price') || headerLine.includes('symbol') ? lines.slice(1) : lines;

        // Check if header format is the new one: Ticker Price (₹) Category Score RSI(14) Vol_Spike Pattern
        const isNewFormat = headerLine.includes('category') || headerLine.includes('vol_spike');

        parsedList = dataLines.map((line) => {
          const parts = line.includes('\t') ? line.split('\t') : line.split(/\s+/);
          const rawTicker = parts[0] || 'RELIANCE.NS';
          const cleanSym = rawTicker.replace('NSE:', '').replace('BSE:', '').replace('.NS', '').replace('.BO', '');
          const meta = findStockInfo(cleanSym);

          let price = 1000;
          let rsi = 50;
          let volRatio = 1.0;
          let score = 70;
          let pattern = 'Standard Trend';

          if (isNewFormat) {
            // Ticker | Price | Category (might be multi-word like "Penny / Micro-Cap") | Score | RSI | Vol_Spike | Pattern
            price = parseFloat(parts[1]) || 100;
            // Let's find parts by type
            const numParts = parts.filter((p) => !isNaN(parseFloat(p)));
            if (numParts.length >= 3) {
              price = parseFloat(numParts[0]) || 100;
              score = parseFloat(numParts[1]) || 70;
              rsi = parseFloat(numParts[2]) || 50;
            }
            const volPart = parts.find((p) => p.endsWith('x'));
            if (volPart) {
              volRatio = parseFloat(volPart.replace('x', '')) || 1.0;
            }
            if (line.includes('Bullish Hammer')) pattern = 'Bullish Hammer';
            else if (line.includes('Bullish Engulfing')) pattern = 'Bullish Engulfing';
            else if (line.includes('Hammer Reversal')) pattern = 'Hammer Reversal';
          } else {
            price = parseFloat(parts[1]) || 1000;
            rsi = parseFloat(parts[2]) || 50;
            volRatio = parseFloat(String(parts[3] || '1.0').replace('x', '')) || 1.0;
            score = 65;
            if (rsi > 50) score += 15;
            if (volRatio >= 1.5) score += 20;
          }

          const symUpper = cleanSym.toUpperCase();
          const isSME = symUpper === "BASILIC" || symUpper === "CELLECOR" || symUpper === "DRONE" || symUpper === "KORE";
          const isBE = symUpper === "JPPOWER" || symUpper === "GTLINFRA" || symUpper === "RPOWER";
          const series = isSME ? "SM" : (isBE ? "BE" : "EQ");

          return {
            symbol: symUpper,
            ticker: `NSE:${symUpper}`,
            isin: `INE${Math.abs(cleanSym.split("").reduce((a, b) => a + b.charCodeAt(0), 1000000000)).toString().padStart(9, "0")}`,
            series,
            name: meta.name,
            exchange: (rawTicker.includes('.BO') || rawTicker.startsWith('BSE:')) ? ('BSE' as const) : ('NSE' as const),
            sector: meta.sector,
            currentPrice: price,
            priceChange: 0,
            priceChangePercent: 0,
            high52Week: price * 1.15,
            low52Week: price * 0.85,
            volume: Math.round(1500000 * volRatio),
            avgVolume20: 1500000,
            volumeSpikeRatio: volRatio,
            rsi14: rsi,
            prevRsi14: rsi - 1.5,
            ema20: price * 0.98,
            ema50: price * 0.95,
            ema200: price * 0.88,
            aboveEma20: true,
            aboveEma50: true,
            aboveEma200: true,
            patterns: [pattern],
            score: Math.min(100, Math.max(20, Math.round(score))),
            scoringReasons: [`${volRatio}x Volume Surge`, pattern, price < 25 ? 'Penny / Micro-Cap Setup' : 'Breakout Trend'],
            dataQualityFlag: isSME ? "SME Emerge (SM)" : (isBE ? "Trade-to-Trade (BE)" : "Active (EQ)"),
          };
        });
      }

      if (parsedList.length === 0) {
        throw new Error('Could not parse any valid stock rows.');
      }

      onImportStocks(parsedList, autoRunAI);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Parsing Error: ${err.message}. Please check format.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#151921] border border-[#2A2E39] rounded w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#151921] border-b border-[#2A2E39] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded bg-[#0B0E11] border border-[#2A2E39] flex items-center justify-center text-[#26A69A]">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Import Python / Colab Screener Payload
              </h3>
              <p className="text-xs text-[#787B86] font-mono">
                Import scanned results from pandas DataFrame, CSV, or JSON (All Indian Equities)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#787B86] hover:text-white hover:bg-[#2A2E39] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#787B86] uppercase tracking-wider text-[10px]">
              DataFrame / CSV / JSON Text:
            </span>
            <button
              onClick={handleLoadSample}
              className="text-[#26A69A] hover:text-[#34b7ab] font-semibold cursor-pointer underline text-[11px]"
            >
              Load Sample Output
            </button>
          </div>

          <textarea
            rows={10}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            placeholder={`Ticker Price (₹) Category Score RSI(14) Vol_Spike Pattern
ZOMATO.NS 272.40 Mid-Cap 100 68.20 3.10x Bullish Engulfing
SUZLON.NS 78.50 Penny / Micro-Cap 100 64.10 2.80x Bullish Hammer
IDEA.NS 8.85 Penny / Micro-Cap 95 58.40 2.45x Bullish Hammer`}
            className="w-full p-3 bg-[#0B0E11] font-mono text-xs text-[#D1D4DC] border border-[#2A2E39] rounded focus:outline-none focus:border-[#26A69A]"
          />

          {errorMsg && (
            <div className="p-2.5 bg-[#EF5350]/10 border border-[#EF5350]/30 rounded text-[#EF5350] text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-2.5 rounded bg-[#0B0E11] border border-[#2A2E39] text-[11px] text-[#787B86] font-mono">
            💡 <strong>Zero Price Floor:</strong> Supports penny stocks (from ₹0.05), SME Emerge issues, and large caps. Paste output from your Python terminal or Google Colab script directly.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-[#151921] border-t border-[#2A2E39] flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#787B86] hover:text-white bg-[#0B0E11] hover:bg-[#2A2E39] border border-[#2A2E39] rounded transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={() => handleParseAndImport(false)}
            className="w-full sm:w-auto px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest text-white bg-[#2A2E39] hover:bg-[#363A45] rounded transition-colors cursor-pointer border border-[#2A2E39]"
          >
            Import to Table
          </button>

          <button
            onClick={() => handleParseAndImport(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest text-black bg-[#26A69A] hover:bg-[#34b7ab] rounded transition-all cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            <span>Import & Generate AI Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
