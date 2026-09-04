import React, { useState, useEffect } from 'react';
import {
  Gauge,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface SectorGauge {
  sector: string;
  score: number;
  sentiment: string;
  change: string;
  pcr: number;
}

interface BulkBlockDeal {
  id: string;
  symbol: string;
  clientName: string;
  dealType: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  dealValueCr: number;
  pctEquity: string;
  timestamp: string;
}

interface MarketMoodData {
  mmi: {
    currentValue: number;
    zone: string;
    status: string;
    history: Array<{ session: string; value: number; zone: string }>;
  };
  sectors: SectorGauge[];
  institutionalFlows: {
    date: string;
    fiiNetCashCr: number;
    diiNetCashCr: number;
    fiiMonthlyNetCr: number;
    diiMonthlyNetCr: number;
    trend: string;
  };
  bulkBlockDeals: BulkBlockDeal[];
}

interface MarketMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const MarketMoodModal: React.FC<MarketMoodModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [data, setData] = useState<MarketMoodData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'mmi' | 'sectors' | 'fii-dii' | 'deals'>('mmi');
  const [dealFilter, setDealFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  const fetchMoodData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market-mood');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch market mood:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMoodData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mmiVal = data?.mmi.currentValue || 64;

  const getMoodColor = (val: number) => {
    if (val <= 30) return '#EF5350'; // Extreme Fear / Fear
    if (val <= 50) return '#FF9800'; // Fear
    if (val <= 70) return '#26A69A'; // Greed
    return '#00E676'; // Extreme Greed
  };

  const filteredDeals = (data?.bulkBlockDeals || []).filter((d) => {
    if (dealFilter === 'ALL') return true;
    return d.action === dealFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#151921] border border-[#2A2E39] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#0B0E11]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#26A69A]/15 text-[#26A69A]">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Market Mood Index (MMI) & Institutional Flows
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/30">
                  Tickertape Parity
                </span>
              </h2>
              <p className="text-xs text-[#787B86]">
                Real-time sentiment gauge, sector relative momentum, FII/DII cash flows, and NSE/BSE bulk deals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMoodData}
              disabled={loading}
              className="p-1.5 rounded text-[#787B86] hover:text-white hover:bg-[#2A2E39] cursor-pointer"
              title="Refresh Mood Index"
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#0B0E11] border-b border-[#2A2E39] text-xs font-mono">
          <button
            onClick={() => setActiveTab('mmi')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'mmi'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            Market Sentiment Gauge
          </button>
          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'sectors'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            Sector Moods ({data?.sectors?.length || 9})
          </button>
          <button
            onClick={() => setActiveTab('fii-dii')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'fii-dii'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            FII / DII Institutional Flows
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            Bulk & Block Deals ({data?.bulkBlockDeals?.length || 5})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: MMI GAUGE */}
          {activeTab === 'mmi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Semicircular Gauge Card */}
                <div className="bg-[#0B0E11] p-5 rounded-lg border border-[#2A2E39] flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#787B86] mb-2">
                    Current Sentiment Level
                  </div>

                  {/* SVG Gauge */}
                  <div className="relative w-56 h-28 flex items-center justify-center">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Gauge Arc Segments */}
                      {/* Extreme Fear (0-20) */}
                      <path
                        d="M 20 90 A 80 80 0 0 1 45 42"
                        fill="none"
                        stroke="#EF5350"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      {/* Fear (20-40) */}
                      <path
                        d="M 47 40 A 80 80 0 0 1 82 22"
                        fill="none"
                        stroke="#FF9800"
                        strokeWidth="16"
                      />
                      {/* Neutral (40-60) */}
                      <path
                        d="M 85 22 A 80 80 0 0 1 115 22"
                        fill="none"
                        stroke="#FFD54F"
                        strokeWidth="16"
                      />
                      {/* Greed (60-80) */}
                      <path
                        d="M 118 22 A 80 80 0 0 1 153 40"
                        fill="none"
                        stroke="#26A69A"
                        strokeWidth="16"
                      />
                      {/* Extreme Greed (80-100) */}
                      <path
                        d="M 155 42 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke="#00E676"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />

                      {/* Needle Indicator */}
                      {(() => {
                        const angle = (mmiVal / 100) * 180 - 180;
                        const rad = (angle * Math.PI) / 180;
                        const nx = 100 + 65 * Math.cos(rad);
                        const ny = 90 + 65 * Math.sin(rad);
                        return (
                          <g>
                            <line
                              x1="100"
                              y1="90"
                              x2={nx}
                              y2={ny}
                              stroke="#FFFFFF"
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                            <circle cx="100" cy="90" r="6" fill="#FFFFFF" />
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="mt-2 text-3xl font-mono font-black" style={{ color: getMoodColor(mmiVal) }}>
                    {mmiVal} / 100
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider text-white mt-0.5">
                    {data?.mmi.zone || 'Greed Zone'}
                  </div>
                  <p className="text-xs text-[#787B86] mt-2 max-w-sm">
                    {data?.mmi.status}
                  </p>
                </div>

                {/* 5-Session Trend History */}
                <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39] flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D1D4DC]">
                      5-Session Sentiment Progression
                    </span>
                    <p className="text-xs text-[#787B86] mt-1 mb-4">
                      Measures shifts between extreme fear (oversold bargains) and extreme greed (overbought euphoria).
                    </p>

                    <div className="space-y-2.5">
                      {(data?.mmi.history || []).map((h, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-mono">
                          <span className="text-[#787B86] w-16">{h.session}</span>
                          <div className="flex-1 mx-3 bg-[#1E222D] h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${h.value}%`,
                                backgroundColor: getMoodColor(h.value),
                              }}
                            />
                          </div>
                          <span className="font-bold text-white w-10 text-right">{h.value}</span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded ml-2 w-20 text-center"
                            style={{
                              backgroundColor: `${getMoodColor(h.value)}20`,
                              color: getMoodColor(h.value),
                            }}
                          >
                            {h.zone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2A2E39] text-[11px] text-[#787B86] flex items-center justify-between">
                    <span>Extreme Fear: &lt; 30</span>
                    <span>Neutral: 30–60</span>
                    <span>Extreme Greed: &gt; 80</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SECTOR GAUGES */}
          {activeTab === 'sectors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(data?.sectors || []).map((sec, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0E11] p-3.5 rounded-lg border border-[#2A2E39] flex flex-col justify-between hover:border-[#26A69A]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">{sec.sector}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        sec.change.startsWith('+')
                          ? 'text-[#26A69A] bg-[#26A69A]/15'
                          : 'text-[#EF5350] bg-[#EF5350]/15'
                      }`}
                    >
                      {sec.change}
                    </span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#787B86]">Sentiment Score:</span>
                      <strong className="text-white">{sec.score} / 100</strong>
                    </div>
                    <div className="w-full bg-[#1E222D] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sec.score}%`,
                          backgroundColor: getMoodColor(sec.score),
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#787B86] pt-2 border-t border-[#2A2E39]/60">
                    <span
                      className="font-bold"
                      style={{ color: getMoodColor(sec.score) }}
                    >
                      {sec.sentiment}
                    </span>
                    <span>PCR: {sec.pcr}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: FII / DII FLOWS */}
          {activeTab === 'fii-dii' && data?.institutionalFlows && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* FII Card */}
                <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase text-[#787B86]">
                      Foreign Institutional Investors (FII)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#26A69A]/20 text-[#26A69A]">
                      Net Buyer
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#26A69A] my-1">
                    +₹{data.institutionalFlows.fiiNetCashCr} Cr
                  </div>
                  <div className="text-xs text-[#787B86]">
                    Monthly MTD Net Inflow: <strong className="text-white">₹{data.institutionalFlows.fiiMonthlyNetCr} Cr</strong>
                  </div>
                </div>

                {/* DII Card */}
                <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase text-[#787B86]">
                      Domestic Institutional Investors (DII)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#26A69A]/20 text-[#26A69A]">
                      Net Buyer
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-[#26A69A] my-1">
                    +₹{data.institutionalFlows.diiNetCashCr} Cr
                  </div>
                  <div className="text-xs text-[#787B86]">
                    Monthly MTD Net Inflow: <strong className="text-white">₹{data.institutionalFlows.diiMonthlyNetCr} Cr</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39] text-xs font-mono flex items-center justify-between text-[#D1D4DC]">
                <span>Market Trend Assessment:</span>
                <span className="font-bold text-[#26A69A]">{data.institutionalFlows.trend}</span>
              </div>
            </div>
          )}

          {/* TAB 4: BULK & BLOCK DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[#787B86]">Action Filter:</span>
                  {(['ALL', 'BUY', 'SELL'] as const).map((af) => (
                    <button
                      key={af}
                      onClick={() => setDealFilter(af)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        dealFilter === af
                          ? 'bg-[#26A69A] text-black'
                          : 'bg-[#0B0E11] text-[#787B86] hover:text-white border border-[#2A2E39]'
                      }`}
                    >
                      {af}
                    </button>
                  ))}
                </div>
                <span className="text-[#787B86]">
                  Showing {filteredDeals.length} disclosures
                </span>
              </div>

              <div className="overflow-x-auto border border-[#2A2E39] rounded">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0B0E11] text-[#787B86] border-b border-[#2A2E39]">
                    <tr>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Client / Institutional Entity</th>
                      <th className="p-2.5">Deal Type</th>
                      <th className="p-2.5">Action</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Avg Price</th>
                      <th className="p-2.5 text-right">Value (₹ Cr)</th>
                      <th className="p-2.5 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2E39]">
                    {filteredDeals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-[#151921] transition-colors">
                        <td className="p-2.5">
                          <button
                            onClick={() => onSelectStock && onSelectStock(deal.symbol)}
                            className="font-bold text-[#26A69A] hover:underline cursor-pointer"
                          >
                            {deal.symbol}
                          </button>
                        </td>
                        <td className="p-2.5 text-white max-w-[220px] truncate" title={deal.clientName}>
                          {deal.clientName}
                        </td>
                        <td className="p-2.5 text-[#787B86]">{deal.dealType}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              deal.action === 'BUY'
                                ? 'bg-[#26A69A]/20 text-[#26A69A]'
                                : 'bg-[#EF5350]/20 text-[#EF5350]'
                            }`}
                          >
                            {deal.action}
                          </span>
                        </td>
                        <td className="p-2.5 text-right text-white">
                          {(deal.quantity / 100000).toFixed(2)}L
                        </td>
                        <td className="p-2.5 text-right text-white">₹{deal.price}</td>
                        <td className="p-2.5 text-right font-bold text-white">
                          ₹{deal.dealValueCr} Cr
                        </td>
                        <td className="p-2.5 text-right text-[#787B86]">{deal.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3 bg-[#0B0E11] border-t border-[#2A2E39] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#787B86]">
          <span>Institutional data source: NSE & BSE Official Regulatory Disclosures.</span>
          <span className="text-[#26A69A]">Updated in Real-Time</span>
        </div>
      </div>
    </div>
  );
};
