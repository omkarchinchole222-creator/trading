import React, { useState } from 'react';
import { X, Code2, Copy, Check, ArrowRight, Sparkles, Terminal, FileText, Database } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayloadModal: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({
  isOpen,
  onClose,
  onOpenPayloadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'system_prompt'>('script');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonCode = `import pandas as pd
import requests
import io
import time
import yfinance as yf
import ta

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

def _nse_session():
    """NSE blocks bare requests without a warmed-up session/cookies — hit the
    homepage first so the session carries valid cookies for the archive URLs."""
    s = requests.Session()
    s.headers.update(HEADERS)
    s.get("https://www.nseindia.com", timeout=10)
    return s

def fetch_nse_mainboard():
    """Full NSE mainboard equity master — EQ/BE/BZ series, all price bands."""
    s = _nse_session()
    r = s.get("https://archives.nseindia.com/content/equities/EQUITY_L.csv", timeout=15)
    df = pd.read_csv(io.StringIO(r.text))
    return df["SYMBOL"].dropna().unique().tolist()

def fetch_nse_sme():
    """NSE Emerge (SME board) — this is where most genuine penny/micro-cap names live."""
    s = _nse_session()
    r = s.get("https://archives.nseindia.com/content/equities/SME_EQUITY_L.csv", timeout=15)
    df = pd.read_csv(io.StringIO(r.text))
    return df["SYMBOL"].dropna().unique().tolist()

def fetch_bse_full_list():
    """Full active BSE scrip master (mainboard + SME), official API — the
    previous script only had a placeholder here, so BSE was never actually loaded."""
    url = ("https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w"
           "?Group=&Scripcode=&industry=&segment=Equity&status=Active")
    r = requests.get(url, headers=HEADERS, timeout=15)
    data = r.json()
    return [(row["SC_CODE"], row["SC_NAME"]) for row in data]

def fetch_all_indian_tickers():
    """Combined, deduplicated universe — no price/cap floor applied anywhere here."""
    nse_main = fetch_nse_mainboard()
    nse_sme = fetch_nse_sme()
    bse_all = fetch_bse_full_list()

    tickers = [f"{sym}.NS" for sym in set(nse_main) | set(nse_sme)]
    tickers += [f"{code}.BO" for code, _ in bse_all]
    tickers = list(set(tickers))

    print(f"NSE mainboard: {len(nse_main)} | NSE SME: {len(nse_sme)} | "
          f"BSE: {len(bse_all)} | Combined unique universe: {len(tickers)}")
    return tickers

def fetch_nse_full_bhavcopy(ddmmyyyy: str):
    """Official EOD OHLCV for EVERY NSE-traded security that day — use this as
    the fallback source for symbols yfinance returns empty for (mainly SME/penny)."""
    s = _nse_session()
    url = f"https://archives.nseindia.com/products/content/sec_bhavdata_full_{ddmmyyyy}.csv"
    r = s.get(url, timeout=15)
    return pd.read_csv(io.StringIO(r.text))

def run_all_market_scanner(tickers, batch_size=100, pause_sec=2):
    """Processes EVERY ticker in the universe by looping through ALL batches
    with an advancing offset — this is the fix for the original single-slice bug."""
    all_results = []
    total = len(tickers)

    for i in range(0, total, batch_size):
        batch = tickers[i : i + batch_size]
        try:
            data = yf.download(batch, period="6mo", interval="1d",
                                group_by="ticker", threads=True, progress=False)
        except Exception as e:
            print(f"Batch {i}-{i+batch_size} failed to download: {e}")
            continue

        for sym in batch:
            try:
                df = data[sym].dropna() if len(batch) > 1 else data.dropna()
                if len(df) < 20:
                    # No/insufficient yfinance data — flag instead of silently skipping.
                    all_results.append({"Ticker": sym, "Status": "no_yfinance_data",
                                         "Note": "check bhavcopy fallback"})
                    continue

                latest, prev = df.iloc[-1], df.iloc[-2]
                curr_price = float(latest["Close"])

                rsi = ta.momentum.RSIIndicator(df["Close"], window=14).rsi().iloc[-1]
                ema_20 = ta.trend.EMAIndicator(df["Close"], window=20).ema_indicator().iloc[-1]
                vol_avg = df["Volume"].rolling(20).mean().iloc[-1]
                vol_spike = round(latest["Volume"] / vol_avg, 2) if vol_avg > 0 else 1.0

                # No price floor: every band gets the same technical treatment.
                category = ("Penny / Micro-Cap" if curr_price < 25 else
                            "Mid-Cap" if curr_price < 500 else "Large/High-Value")

                score = 50
                if rsi > 50: score += 15
                if curr_price > ema_20: score += 15
                if vol_spike >= 1.5: score += 20

                all_results.append({
                    "Ticker": sym, "Status": "ok", "Price (₹)": round(curr_price, 2),
                    "Category": category, "Score": score, "RSI(14)": round(rsi, 2),
                    "Vol_Spike": f"{vol_spike}x",
                })
            except Exception:
                all_results.append({"Ticker": sym, "Status": "processing_error"})
                continue

        print(f"Processed {min(i + batch_size, total)}/{total} symbols...")
        time.sleep(pause_sec)

    df_out = pd.DataFrame(all_results)
    ok = df_out[df_out["Status"] == "ok"].sort_values(by="Score", ascending=False)
    flagged = df_out[df_out["Status"] != "ok"]
    print(f"\\nScanned {total} | Scored {len(ok)} | Flagged/no-data {len(flagged)}")
    return ok, flagged

if __name__ == "__main__":
    all_tickers = fetch_all_indian_tickers()
    ranked, flagged = run_all_market_scanner(all_tickers, batch_size=100)
    print("\\n--- FULL RANKED UNIVERSE (paste into your AI layer) ---\\n")
    print(ranked.to_string(index=False))`;

  const systemPromptText = `You are an institutional-grade quantitative trading terminal and personal investment
assistant covering the ENTIRE Indian equity universe across NSE and BSE, including
NSE Emerge and BSE SME boards — every listed security regardless of price, from
sub-₹1 penny stocks to ₹1,00,000+ high-value shares. No stock is excluded by default.

MANDATORY COVERAGE RULES:
1. You must treat the input ticker/data list as the FULL universe provided to you.
   Never silently analyze only a subset (e.g. "the first 100") and present it as
   the complete scan — if you were only given a partial batch, say so explicitly
   and state how many more remain unscanned.
2. Zero price filtering: penny stocks, SME-board stocks, and large-caps all get
   the same technical/fundamental scrutiny. Never omit a stock from output because
   its price is very low or very high.
3. If a stock has no usable price/volume data for the period requested, include it
   in the output with status "no data" rather than dropping it from the list —
   the user needs to see it was checked, not silently excluded.

UNIVERSAL TRADING RULES:
- Penny / SME Stocks (₹0.01–₹25): flag circuit-limit proximity (2%/5%/10%),
  volume breakout spikes (>2x 20-day average), and accumulation-base patterns.
- Mid/Large Cap (₹25–₹1,00,000+): prioritize EMA confluence (20>50>200),
  RSI momentum zone (45–65), and institutional delivery-volume trends.
- Rank all evaluated stocks in strict descending order by Conviction Score (0–100).
- Every entry needs a mathematically anchored entry zone, target(s), and
  invalidation stop-loss (from recent swing structure), minimum R:R of 1:2.
- Every claim (price, news, catalyst) must be sourced and timestamped — never
  invent a catalyst or a data point that wasn't in the provided data.

OUTPUT — FULL MARKET SCAN:
| Rank | Exchange:Ticker | Category | LTP (₹) | Status | Signal | Score | Pattern | Entry Range | Target 1 | Target 2 | Stop-Loss | Volume/Catalyst |

Include a final summary line: "Scanned: [N] | Scored: [N] | No-data/flagged: [N]" —
this count must match the size of the universe you were actually given.

OUTPUT — SINGLE STOCK AUDIT:
1. Executive Snapshot: [EXCHANGE:TICKER] | Category | LTP | Signal | Score
2. Indicator Matrix: RSI(14), EMA alignment, Volume vs 20-day average, Support/Resistance
3. News & Fundamental Catalyst (sourced, timestamped, or "no verified news")
4. Execution Ticket: Order Type | Entry Range | Target 1/2 | Stop-Loss | R:R Ratio

This is analysis, not investment advice. Frame every signal as a probability-based
setup ("technical setup favors X, invalidated below Y"), never a guarantee.`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#151921] border border-[#2A2E39] rounded w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-[#151921] border-b border-[#2A2E39] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded bg-[#0B0E11] border border-[#2A2E39] flex items-center justify-center text-[#26A69A]">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Full-Market Ingestion & System Prompt Hub
              </h3>
              <p className="text-xs text-[#787B86] font-mono">
                All 6,000+ NSE & BSE Equities (₹0.05 Penny to ₹1,00,000+ High-Value Shares)
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-[#2A2E39] bg-[#0B0E11]">
          <button
            onClick={() => setActiveTab('script')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'script'
                ? 'border-[#26A69A] text-white bg-[#151921]/60'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-[#26A69A]" />
            <span>1. Python Ingestion Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('system_prompt')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'system_prompt'
                ? 'border-[#26A69A] text-white bg-[#151921]/60'
                : 'border-transparent text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#26A69A]" />
            <span>2. Master All-Stock AI System Prompt</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs font-mono">
          {activeTab === 'script' ? (
            <>
              {/* Quick instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] block mb-1">
                    1. Install Libraries
                  </span>
                  <code className="text-[11px] text-[#26A69A] bg-[#151921] px-2 py-0.5 rounded border border-[#2A2E39] block">
                    pip install pandas yfinance ta requests
                  </code>
                </div>

                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] block mb-1">
                    2. Complete Coverage
                  </span>
                  <p className="text-[#787B86] text-[11px]">
                    Scans official <code className="text-[#26A69A]">EQUITY_L.csv</code> (EQ, BE, SM series) with zero price floor.
                  </p>
                </div>

                <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] block mb-1">
                    3. Output Pipeline
                  </span>
                  <p className="text-[#787B86] text-[11px]">
                    Outputs ranked dataframe with RSI, Volume Spike, and Candle Anatomy for AI import.
                  </p>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded overflow-hidden border border-[#2A2E39] bg-[#0B0E11]">
                <div className="p-2 bg-[#151921] border-b border-[#2A2E39] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#787B86]">all_indian_stocks_screener.py</span>
                  <button
                    id="copy-python-code-btn"
                    onClick={() => handleCopy(pythonCode)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0E11] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#2A2E39] text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-[#26A69A]" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Python Code'}</span>
                  </button>
                </div>

                <pre className="p-3.5 font-mono text-[11px] text-[#D1D4DC] overflow-x-auto max-h-72 leading-relaxed">
                  <code>{pythonCode}</code>
                </pre>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39] text-[#D1D4DC]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#26A69A] uppercase tracking-wider text-[11px]">
                    Institutional All-Stock Terminal Prompt (NSE / BSE / Penny / SME)
                  </span>
                  <button
                    onClick={() => handleCopy(systemPromptText)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#151921] hover:bg-[#2A2E39] text-[#D1D4DC] border border-[#2A2E39] text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                  >
                    {copied ? <Check className="h-3 w-3 text-[#26A69A]" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? 'Copied!' : 'Copy System Instructions'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#787B86] leading-relaxed">
                  Paste this into Google AI Studio system instructions to produce broker-grade execution tickets, ASCII candlestick diagrams, and ranked multi-stock trade tables.
                </p>
              </div>

              <div className="relative rounded overflow-hidden border border-[#2A2E39] bg-[#0B0E11]">
                <pre className="p-3.5 font-mono text-[11px] text-[#D1D4DC] overflow-x-auto max-h-80 leading-relaxed whitespace-pre-wrap">
                  <code>{systemPromptText}</code>
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-[#151921] border-t border-[#2A2E39] flex items-center justify-between">
          <span className="text-xs text-[#787B86] font-mono">
            Full NSE/BSE Universe (0.05 to 1,00,000+)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest text-[#787B86] hover:text-white bg-[#0B0E11] hover:bg-[#2A2E39] border border-[#2A2E39] rounded cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenPayloadModal();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] uppercase font-bold tracking-widest text-black bg-[#26A69A] hover:bg-[#34b7ab] rounded cursor-pointer"
            >
              <span>Paste Payload</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
