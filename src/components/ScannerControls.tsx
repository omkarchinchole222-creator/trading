import React, { useState, useEffect } from 'react';
import {
  Filter,
  SlidersHorizontal,
  Zap,
  Plus,
  X,
  Layers,
  Save,
  Trash2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  BarChart2,
  DollarSign,
  FileText,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  ScanFilterOptions,
  FilterPreset,
  MarketCapCategory,
  BreakoutFilterStatus,
  TrendDirection,
} from '../types';

interface ScannerControlsProps {
  filterOptions: ScanFilterOptions;
  onChangeFilterOptions: (options: ScanFilterOptions) => void;
  activePreset: string;
  onSelectPreset: (preset: string) => void;
  onRunScan: () => void;
  isScanning: boolean;
  onAddCustomTicker: (ticker: string) => void;
  onRemoveCustomTicker: (ticker: string) => void;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Universe',
    description: 'All scanned stocks with standard baseline filters',
    filters: {
      minScore: 0,
      rsiMin: 0,
      rsiMax: 100,
      volumeRatioMin: 0.5,
      marketCap: 'all',
      breakoutStatus: 'all',
      trendDirection: 'all',
      profitableOnly: false,
      hasVerifiedNewsOnly: false,
    },
  },
  {
    id: 'vol-breakout',
    name: 'High-Volume Breakout',
    description: 'Volume > 1.5x with confirmed pattern and price > 20 EMA',
    filters: {
      volumeRatioMin: 1.5,
      mustBeAboveEma20: true,
      breakoutStatus: 'confirmed',
      minScore: 65,
    },
  },
  {
    id: 'penny-momentum',
    name: 'Penny Stock Momentum',
    description: 'Stocks under ₹300 with high volume breakout and volatility',
    filters: {
      maxPrice: 300,
      marketCap: 'penny',
      volumeRatioMin: 1.8,
      minScore: 60,
    },
  },
  {
    id: 'blue-chip-value',
    name: 'Blue-Chip Value',
    description: 'Nifty 50 / Large cap with P/E < 35, low debt & profitable',
    filters: {
      index: 'NIFTY50',
      marketCap: 'large',
      profitableOnly: true,
      maxPe: 35,
      mustBeAboveEma200: true,
      minScore: 60,
    },
  },
  {
    id: 'oversold-reversal',
    name: 'Oversold Reversal',
    description: 'RSI between 30 and 48 forming hammer or bullish reversal',
    filters: {
      rsiMin: 28,
      rsiMax: 48,
      minScore: 55,
    },
  },
  {
    id: 'golden-ema',
    name: 'EMA Golden Alignment',
    description: 'Price above 20, 50, and 200 EMAs in stacked bullish trend',
    filters: {
      mustBeAboveEma20: true,
      mustBeAboveEma50: true,
      mustBeAboveEma200: true,
      trendDirection: 'uptrend',
      minScore: 70,
    },
  },
  {
    id: 'pre-earnings-swing',
    name: 'Pre-Earnings & News Swing',
    description: 'Stocks with recent verified corporate news and momentum',
    filters: {
      hasVerifiedNewsOnly: true,
      volumeRatioMin: 1.2,
      minScore: 60,
    },
  },
];

const PATTERN_OPTIONS = [
  'Bullish Engulfing',
  'Hammer Reversal',
  'Morning Star',
  'Three White Soldiers',
  'EMA Golden Alignment',
  'Volume Breakout',
  'RSI Momentum Reversal',
  'Cup & Handle',
];

export const ScannerControls: React.FC<ScannerControlsProps> = ({
  filterOptions,
  onChangeFilterOptions,
  activePreset,
  onSelectPreset,
  onRunScan,
  isScanning,
  onAddCustomTicker,
  onRemoveCustomTicker,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'price' | 'volume' | 'technical' | 'fundamental' | 'news'>('technical');
  const [tickerInput, setTickerInput] = useState('');
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  // Load custom presets from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('screener_custom_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom presets', e);
    }
  }, []);

  const handleSaveCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      description: 'Custom user defined screen combo',
      isCustom: true,
      filters: { ...filterOptions },
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('screener_custom_presets', JSON.stringify(updated));
    setNewPresetName('');
    setShowSavePresetModal(false);
    onSelectPreset(newPreset.id);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('screener_custom_presets', JSON.stringify(updated));
    if (activePreset === id) {
      onSelectPreset('all');
    }
  };

  const handleResetFilters = () => {
    onChangeFilterOptions({
      index: 'NIFTY50',
      exchange: 'ALL',
      filterLogic: 'AND',
      minPrice: 0,
      maxPrice: 100000,
      marketCap: 'all',
      volumeRatioMin: 0.5,
      minAvgVolume: 0,
      unusualVolumeOnly: false,
      minScore: 0,
      rsiMin: 0,
      rsiMax: 100,
      mustBeAboveEma20: false,
      mustBeAboveEma50: false,
      mustBeAboveEma200: false,
      patternsRequired: [],
      breakoutStatus: 'all',
      trendDirection: 'all',
      profitableOnly: false,
      hasVerifiedNewsOnly: false,
    });
    onSelectPreset('all');
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;
    const clean = tickerInput.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    onAddCustomTicker(clean);
    setTickerInput('');
  };

  const togglePattern = (pattern: string) => {
    const current = filterOptions.patternsRequired || [];
    if (current.includes(pattern)) {
      onChangeFilterOptions({
        ...filterOptions,
        patternsRequired: current.filter((p) => p !== pattern),
      });
    } else {
      onChangeFilterOptions({
        ...filterOptions,
        patternsRequired: [...current, pattern],
      });
    }
  };

  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  return (
    <div className="bg-[#151921] border border-[#2A2E39] rounded sm:rounded p-3.5 sm:p-4 space-y-3.5">
      {/* Top Bar: Universe Selector & Primary Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3 border-b border-[#2A2E39]">
        {/* Universe Selector */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#787B86] mr-1 flex items-center gap-1 font-semibold">
            <Layers className="h-3 w-3 text-[#26A69A]" /> Universe:
          </span>

          {(
            [
              { id: 'ALL_NSE_BSE', label: 'All 5,000+ Listed (ISIN Master)' },
              { id: 'NIFTY50', label: 'Nifty 50' },
              { id: 'NIFTY500_TOP', label: 'Nifty 500 Leaders' },
              { id: 'NIFTY_MIDCAP', label: 'Nifty Midcap' },
              { id: 'NIFTY_SMALLCAP', label: 'Smallcap & Penny' },
              { id: 'NIFTY_BANK', label: 'Bank Nifty' },
              { id: 'CUSTOM', label: 'Custom Watchlist' },
            ] as const
          ).map((item) => {
            const isActive = filterOptions.index === item.id;
            return (
              <button
                key={item.id}
                id={`universe-btn-${item.id}`}
                onClick={() => onChangeFilterOptions({ ...filterOptions, index: item.id })}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#26A69A] text-black font-bold'
                    : 'bg-[#0B0E11] text-[#787B86] hover:text-[#D1D4DC] hover:bg-[#2A2E39] border border-[#2A2E39]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Scan and Filter Buttons */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          {/* AND / OR Cross-Category Logic */}
          <div className="flex items-center bg-[#0B0E11] rounded border border-[#2A2E39] p-0.5 text-[10px] font-mono">
            <button
              id="filter-logic-and-btn"
              type="button"
              onClick={() => onChangeFilterOptions({ ...filterOptions, filterLogic: 'AND' })}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                filterOptions.filterLogic === 'AND'
                  ? 'bg-[#26A69A] text-black font-bold'
                  : 'text-[#787B86] hover:text-white'
              }`}
              title="AND: Must match all filter criteria"
            >
              AND
            </button>
            <button
              id="filter-logic-or-btn"
              type="button"
              onClick={() => onChangeFilterOptions({ ...filterOptions, filterLogic: 'OR' })}
              className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                filterOptions.filterLogic === 'OR'
                  ? 'bg-[#26A69A] text-black font-bold'
                  : 'text-[#787B86] hover:text-white'
              }`}
              title="OR: Matches if any category passes"
            >
              OR
            </button>
          </div>

          <button
            id="toggle-advanced-filters-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded transition-colors cursor-pointer border ${
              showAdvanced
                ? 'bg-[#2A2E39] text-white border-[#26A69A]'
                : 'bg-[#0B0E11] text-[#787B86] hover:text-white border-[#2A2E39] hover:bg-[#2A2E39]'
            }`}
          >
            <SlidersHorizontal className="h-3 w-3 text-[#26A69A]" />
            <span>Filter Panel</span>
          </button>

          <button
            id="run-scanner-main-btn"
            onClick={onRunScan}
            disabled={isScanning}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[10px] uppercase font-bold tracking-widest rounded bg-[#26A69A] text-black hover:bg-[#34b7ab] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className={`h-3 w-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Live Scan'}</span>
          </button>
        </div>
      </div>

      {/* Custom Tickers Input Bar (if CUSTOM) */}
      {filterOptions.index === 'CUSTOM' && (
        <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono text-[#D1D4DC]">
              Custom Symbols ({filterOptions.customTickers?.length || 0})
            </span>
            <span className="text-[10px] text-[#787B86] font-mono">e.g. RELIANCE, TCS, ZOMATO, DIXON</span>
          </div>

          <form onSubmit={handleAddTicker} className="flex gap-2 mb-2.5">
            <input
              id="custom-ticker-input"
              type="text"
              placeholder="Enter Stock Symbol (e.g. TATAMOTORS, DIXON)..."
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              className="flex-1 px-3 py-1 text-xs bg-[#151921] border border-[#2A2E39] rounded text-white placeholder-[#787B86] font-mono focus:outline-none focus:border-[#26A69A]"
            />
            <button
              id="add-custom-ticker-btn"
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1 text-[10px] uppercase font-bold tracking-widest bg-[#26A69A] text-black hover:bg-[#34b7ab] rounded cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {(filterOptions.customTickers || []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-[#151921] text-[#26A69A] border border-[#2A2E39]"
              >
                {t}
                <button
                  type="button"
                  onClick={() => onRemoveCustomTicker(t)}
                  className="hover:text-[#EF5350] transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Preset Strategy Selector Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#787B86] flex items-center gap-1.5 font-semibold">
            <Filter className="h-3 w-3 text-[#26A69A]" /> Screening Presets & Custom Combos:
          </div>
          <div className="flex items-center gap-2">
            <button
              id="save-current-preset-btn"
              onClick={() => setShowSavePresetModal(true)}
              className="text-[10px] font-mono text-[#26A69A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Save className="h-3 w-3" /> Save Preset
            </button>
            <button
              id="reset-all-filters-btn"
              onClick={handleResetFilters}
              className="text-[10px] font-mono text-[#787B86] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          {allPresets.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => onSelectPreset(preset.id)}
                className={`relative flex flex-col justify-between p-2 rounded text-left transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#2A2E39] border-l-2 border-l-[#26A69A] border-y-[#2A2E39] border-r-[#2A2E39] text-white shadow-xs'
                    : 'bg-[#0B0E11] hover:bg-[#2A2E39] border-[#2A2E39] text-[#787B86] hover:text-[#D1D4DC]'
                }`}
                title={preset.description}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-mono font-semibold truncate pr-1 text-white">
                    {preset.name}
                  </span>
                  {preset.isCustom && (
                    <span
                      onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
                      className="text-[#787B86] hover:text-[#EF5350] p-0.5 cursor-pointer"
                      title="Delete Preset"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-[#787B86] line-clamp-1 mt-0.5">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Preset Dialog / Form */}
      {showSavePresetModal && (
        <div className="p-3 bg-[#0B0E11] rounded border border-[#26A69A]/40 flex flex-col sm:flex-row items-center gap-2">
          <span className="text-xs text-white font-mono shrink-0">Name Custom Preset:</span>
          <form onSubmit={handleSaveCustomPreset} className="flex-1 flex gap-2 w-full">
            <input
              type="text"
              placeholder="e.g. My High Momentum Swing..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1 px-3 py-1 bg-[#151921] border border-[#2A2E39] rounded text-white text-xs font-mono focus:outline-none focus:border-[#26A69A]"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#26A69A] text-black font-bold text-[10px] uppercase tracking-wider rounded cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSavePresetModal(false)}
              className="px-2 py-1 bg-[#2A2E39] text-[#787B86] text-[10px] rounded cursor-pointer hover:text-white"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Advanced Multi-Category Filter Panel */}
      {showAdvanced && (
        <div className="pt-3 border-t border-[#2A2E39] space-y-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono border-b border-[#2A2E39] pb-2">
            {[
              { id: 'price', label: 'Price & Market Cap', icon: DollarSign },
              { id: 'volume', label: 'Volume & Liquidity', icon: BarChart2 },
              { id: 'technical', label: 'Technical Indicators', icon: TrendingUp },
              { id: 'fundamental', label: 'Fundamentals', icon: Shield },
              { id: 'news', label: 'News & Events', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#26A69A] text-black font-bold'
                      : 'bg-[#0B0E11] text-[#787B86] hover:text-white hover:bg-[#2A2E39] border border-[#2A2E39]'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Price & Market Cap */}
          {activeTab === 'price' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Market Cap Band */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Market Cap Band:
                </span>
                <select
                  id="filter-market-cap-select"
                  value={filterOptions.marketCap}
                  onChange={(e) =>
                    onChangeFilterOptions({ ...filterOptions, marketCap: e.target.value as MarketCapCategory })
                  }
                  className="w-full px-2 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono text-xs focus:outline-none focus:border-[#26A69A]"
                >
                  <option value="all">All Market Caps</option>
                  <option value="penny">Penny Stock (&lt; ₹100)</option>
                  <option value="micro">Micro Cap (₹100 - ₹500)</option>
                  <option value="small">Small Cap (₹500 - ₹1,500)</option>
                  <option value="mid">Mid Cap (₹1,500 - ₹4,000)</option>
                  <option value="large">Large Cap / Blue-Chip (&gt; ₹4,000)</option>
                </select>
                <div className="text-[10px] font-mono text-[#787B86]">Configurable market cap tiers</div>
              </div>

              {/* Price Min / Max (₹) */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Price Range (₹):
                </span>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min ₹"
                    value={filterOptions.minPrice || ''}
                    onChange={(e) =>
                      onChangeFilterOptions({ ...filterOptions, minPrice: Number(e.target.value) || 0 })
                    }
                    className="w-1/2 px-2 py-1 bg-[#151921] border border-[#2A2E39] rounded text-center text-white font-mono text-xs"
                  />
                  <span className="text-[#787B86] font-mono">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max ₹"
                    value={filterOptions.maxPrice === 100000 ? '' : filterOptions.maxPrice}
                    onChange={(e) =>
                      onChangeFilterOptions({
                        ...filterOptions,
                        maxPrice: e.target.value ? Number(e.target.value) : 100000,
                      })
                    }
                    className="w-1/2 px-2 py-1 bg-[#151921] border border-[#2A2E39] rounded text-center text-white font-mono text-xs"
                  />
                </div>
                <div className="text-[10px] font-mono text-[#787B86]">Leave blank for unrestricted</div>
              </div>

              {/* 52-Week High Proximity */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium">
                    Within % of 52W High:
                  </span>
                  <span className="font-mono font-bold text-[#26A69A]">
                    {filterOptions.near52wHighPct ? `${filterOptions.near52wHighPct}%` : 'Off'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="2"
                  value={filterOptions.near52wHighPct || 0}
                  onChange={(e) =>
                    onChangeFilterOptions({
                      ...filterOptions,
                      near52wHighPct: Number(e.target.value) || undefined,
                    })
                  }
                  className="w-full accent-[#26A69A] cursor-pointer"
                />
                <div className="text-[10px] font-mono text-[#787B86]">Screens near all-time breakout highs</div>
              </div>

              {/* Exchange Filter */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Exchange:
                </span>
                <select
                  value={filterOptions.exchange || 'ALL'}
                  onChange={(e) =>
                    onChangeFilterOptions({ ...filterOptions, exchange: e.target.value as any })
                  }
                  className="w-full px-2 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono text-xs focus:outline-none focus:border-[#26A69A]"
                >
                  <option value="ALL">All Exchanges (NSE + BSE)</option>
                  <option value="NSE">NSE Only</option>
                  <option value="BSE">BSE Only</option>
                </select>
                <div className="text-[10px] font-mono text-[#787B86]">Primary liquidity filter</div>
              </div>

              {/* Series & Surveillance Filter */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A2E39] pb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#26A69A] font-bold">
                    Full Market Coverage & Series Switches (Section 15):
                  </span>
                  <span className="text-[10px] font-mono text-[#787B86]">
                    Universe: 5,142 ISIN-deduped equities • ₹0.00 Floor (All Penny & SME Included)
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono text-[#D1D4DC]">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={filterOptions.includeSME ?? true}
                      onChange={(e) =>
                        onChangeFilterOptions({ ...filterOptions, includeSME: e.target.checked })
                      }
                      className="rounded accent-[#26A69A]"
                    />
                    <span>Include SME Platforms (NSE Emerge / BSE SME)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={filterOptions.includeTradeToTrade ?? true}
                      onChange={(e) =>
                        onChangeFilterOptions({ ...filterOptions, includeTradeToTrade: e.target.checked })
                      }
                      className="rounded accent-[#26A69A]"
                    />
                    <span>Include Trade-to-Trade (BE Series)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={filterOptions.includeZGroup ?? true}
                      onChange={(e) =>
                        onChangeFilterOptions({ ...filterOptions, includeZGroup: e.target.checked })
                      }
                      className="rounded accent-[#26A69A]"
                    />
                    <span>Include Surveillance / Z-Group (BZ)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Volume & Liquidity */}
          {activeTab === 'volume' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Relative Volume Ratio */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium">
                    Volume Surge vs 20-DMA:
                  </span>
                  <span className="font-mono font-bold text-[#26A69A]">
                    {filterOptions.volumeRatioMin}x Avg
                  </span>
                </div>
                <input
                  id="filter-vol-ratio-slider"
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={filterOptions.volumeRatioMin}
                  onChange={(e) =>
                    onChangeFilterOptions({ ...filterOptions, volumeRatioMin: Number(e.target.value) })
                  }
                  className="w-full accent-[#26A69A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#787B86]">
                  <span>0.5x</span>
                  <span>1.5x (Breakout)</span>
                  <span>3.0x+</span>
                </div>
              </div>

              {/* Unusual Volume Outliers Only */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] flex flex-col justify-center space-y-2 font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-[#D1D4DC] hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterOptions.unusualVolumeOnly || false}
                    onChange={(e) =>
                      onChangeFilterOptions({ ...filterOptions, unusualVolumeOnly: e.target.checked })
                    }
                    className="rounded accent-[#26A69A] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white">Unusual Volume Spikes Only</span>
                </label>
                <p className="text-[10px] text-[#787B86]">
                  Excludes normal distribution volume; selects 2.0x+ standard deviation volume surges.
                </p>
              </div>

              {/* Breakout Verification Status */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Breakout Quality Flag:
                </span>
                <select
                  value={filterOptions.breakoutStatus || 'all'}
                  onChange={(e) =>
                    onChangeFilterOptions({
                      ...filterOptions,
                      breakoutStatus: e.target.value as BreakoutFilterStatus,
                    })
                  }
                  className="w-full px-2 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono text-xs focus:outline-none focus:border-[#26A69A]"
                >
                  <option value="all">All Breakouts</option>
                  <option value="confirmed">Confirmed Breakouts (Price + Volume)</option>
                  <option value="unconfirmed">Unconfirmed Spikes (Volume only)</option>
                </select>
                <div className="text-[10px] font-mono text-[#787B86]">Enforces anti-fake-data rule</div>
              </div>
            </div>
          )}

          {/* Tab 3: Technical Indicators */}
          {activeTab === 'technical' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Opportunity Score */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium">
                    Min Composite Score:
                  </span>
                  <span className="font-mono font-bold text-[#26A69A]">{filterOptions.minScore} / 100</span>
                </div>
                <input
                  id="filter-min-score-slider"
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={filterOptions.minScore}
                  onChange={(e) =>
                    onChangeFilterOptions({ ...filterOptions, minScore: Number(e.target.value) })
                  }
                  className="w-full accent-[#26A69A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#787B86] mt-1">
                  <span>0</span>
                  <span>50 (Balanced)</span>
                  <span>70+ (High Conviction)</span>
                </div>
              </div>

              {/* RSI(14) Range */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium">
                    RSI(14) Range:
                  </span>
                  <span className="font-mono font-bold text-[#26A69A]">
                    {filterOptions.rsiMin} - {filterOptions.rsiMax}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filterOptions.rsiMin}
                    onChange={(e) =>
                      onChangeFilterOptions({ ...filterOptions, rsiMin: Number(e.target.value) })
                    }
                    className="w-1/2 px-2 py-1 bg-[#151921] border border-[#2A2E39] rounded text-center text-white font-mono text-xs"
                  />
                  <span className="text-[#787B86] font-mono">-</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filterOptions.rsiMax}
                    onChange={(e) =>
                      onChangeFilterOptions({ ...filterOptions, rsiMax: Number(e.target.value) })
                    }
                    className="w-1/2 px-2 py-1 bg-[#151921] border border-[#2A2E39] rounded text-center text-white font-mono text-xs"
                  />
                </div>
                <div className="text-[10px] font-mono text-[#787B86] mt-1">
                  Accumulation zone: 40 - 65
                </div>
              </div>

              {/* Trend Direction & Moving Averages */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Trend Direction:
                </span>
                <select
                  value={filterOptions.trendDirection || 'all'}
                  onChange={(e) =>
                    onChangeFilterOptions({
                      ...filterOptions,
                      trendDirection: e.target.value as TrendDirection,
                    })
                  }
                  className="w-full px-2 py-1 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono text-xs focus:outline-none focus:border-[#26A69A]"
                >
                  <option value="all">Any Trend</option>
                  <option value="uptrend">Bullish Uptrend (ADX + MA Slope)</option>
                  <option value="sideways">Rangebound / Consolidation</option>
                  <option value="downtrend">Downtrend</option>
                </select>

                <div className="pt-1 space-y-1 font-mono text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#D1D4DC] hover:text-white">
                    <input
                      type="checkbox"
                      checked={filterOptions.mustBeAboveEma20}
                      onChange={(e) =>
                        onChangeFilterOptions({ ...filterOptions, mustBeAboveEma20: e.target.checked })
                      }
                      className="rounded accent-[#26A69A]"
                    />
                    <span>Price &gt; 20 EMA</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#D1D4DC] hover:text-white">
                    <input
                      type="checkbox"
                      checked={filterOptions.mustBeAboveEma50}
                      onChange={(e) =>
                        onChangeFilterOptions({ ...filterOptions, mustBeAboveEma50: e.target.checked })
                      }
                      className="rounded accent-[#26A69A]"
                    />
                    <span>Price &gt; 50 EMA</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#D1D4DC] hover:text-white">
                    <input
                      type="checkbox"
                      checked={filterOptions.mustBeAboveEma200}
                      onChange={(e) =>
                        onChangeFilterOptions({ ...filterOptions, mustBeAboveEma200: e.target.checked })
                      }
                      className="rounded accent-[#26A69A]"
                    />
                    <span>Price &gt; 200 EMA</span>
                  </label>
                </div>
              </div>

              {/* Specific Candlestick Patterns Selector */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Candlestick Pattern Filter:
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                  {PATTERN_OPTIONS.map((pattern) => {
                    const isChecked = (filterOptions.patternsRequired || []).includes(pattern);
                    return (
                      <label
                        key={pattern}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition-colors ${
                          isChecked ? 'bg-[#26A69A]/15 text-[#26A69A]' : 'text-[#787B86] hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePattern(pattern)}
                          className="rounded accent-[#26A69A]"
                        />
                        <span className="truncate">{pattern}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Fundamentals */}
          {activeTab === 'fundamental' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Max P/E Ceiling */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  P/E Ratio Ceiling:
                </span>
                <input
                  type="number"
                  placeholder="e.g. 40 (Max P/E)"
                  value={filterOptions.maxPe || ''}
                  onChange={(e) =>
                    onChangeFilterOptions({
                      ...filterOptions,
                      maxPe: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono text-xs focus:outline-none focus:border-[#26A69A]"
                />
                <div className="text-[10px] font-mono text-[#787B86]">Filters out overvalued multiples</div>
              </div>

              {/* Max Debt to Equity */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider text-[#787B86] font-medium block">
                  Debt-to-Equity Ceiling:
                </span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1.0"
                  value={filterOptions.maxDebtToEquity || ''}
                  onChange={(e) =>
                    onChangeFilterOptions({
                      ...filterOptions,
                      maxDebtToEquity: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-2 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white font-mono text-xs focus:outline-none focus:border-[#26A69A]"
                />
                <div className="text-[10px] font-mono text-[#787B86]">Low leverage / clean balance sheet</div>
              </div>

              {/* Profitable Companies Only */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] flex flex-col justify-center space-y-2 font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-[#D1D4DC] hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterOptions.profitableOnly || false}
                    onChange={(e) =>
                      onChangeFilterOptions({ ...filterOptions, profitableOnly: e.target.checked })
                    }
                    className="rounded accent-[#26A69A] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white">Profitable Companies Only</span>
                </label>
                <p className="text-[10px] text-[#787B86]">
                  Excludes loss-making companies; ensures positive net income & operating margins.
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: News & Events */}
          {activeTab === 'news' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Has Verified News Toggle */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] space-y-2 font-mono">
                <label className="flex items-center gap-2 cursor-pointer text-[#D1D4DC] hover:text-white">
                  <input
                    type="checkbox"
                    checked={filterOptions.hasVerifiedNewsOnly || false}
                    onChange={(e) =>
                      onChangeFilterOptions({ ...filterOptions, hasVerifiedNewsOnly: e.target.checked })
                    }
                    className="rounded accent-[#26A69A] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white">Has Verified Corporate News</span>
                </label>
                <p className="text-[10px] text-[#787B86]">
                  Only includes stocks with timestamped announcements from official exchange filings or Reuters/PTI feeds.
                </p>
              </div>

              {/* Risk Disclaimer Reminder */}
              <div className="bg-[#0B0E11] p-3 rounded border border-[#2A2E39] flex items-center gap-2 text-[#787B86] text-xs">
                <HelpCircle className="h-4 w-4 text-[#26A69A] shrink-0" />
                <span>
                  Anti-Fake-Data compliance: AI never synthesizes rumors. If no confirmed news exists within the window, the news module outputs &quot;no verified news in window&quot;.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
