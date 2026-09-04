import React, { useState } from 'react';
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Flame,
  CheckCircle,
  Sparkles,
  BarChart2,
  CheckSquare,
  Square,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
  Info,
} from 'lucide-react';
import { ScannedStock } from '../types';

interface ScannerResultsTableProps {
  stocks: ScannedStock[];
  selectedSymbols: string[];
  onToggleSelectSymbol: (symbol: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onOpenStockModal: (stock: ScannedStock) => void;
  onAnalyzeStockAI: (stock: ScannedStock) => void;
}

type SortField = 'score' | 'currentPrice' | 'priceChangePercent' | 'rsi14' | 'volumeSpikeRatio' | 'symbol';

export const ScannerResultsTable: React.FC<ScannerResultsTableProps> = ({
  stocks,
  selectedSymbols,
  onToggleSelectSymbol,
  onSelectAll,
  onDeselectAll,
  onOpenStockModal,
  onAnalyzeStockAI,
}) => {
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [seriesFilter, setSeriesFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default descending
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      stock.symbol.toLowerCase().includes(term) ||
      stock.name.toLowerCase().includes(term) ||
      stock.sector.toLowerCase().includes(term) ||
      (stock.isin && stock.isin.toLowerCase().includes(term)) ||
      stock.patterns.some((p) => p.toLowerCase().includes(term));

    const matchesSeries =
      seriesFilter === 'ALL' ||
      (seriesFilter === 'EQ' && (!stock.series || stock.series === 'EQ')) ||
      (seriesFilter === 'SME' && (stock.series === 'SM' || stock.series === 'ST')) ||
      (seriesFilter === 'BE' && stock.series === 'BE') ||
      (seriesFilter === 'BZ' && stock.series === 'BZ');

    return matchesSearch && matchesSeries;
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const totalPages = Math.max(1, Math.ceil(sortedStocks.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedStocks = sortedStocks.slice((validPage - 1) * pageSize, validPage * pageSize);

  const allSelected = sortedStocks.length > 0 && sortedStocks.every((s) => selectedSymbols.includes(s.symbol));

  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return 'bg-[#26A69A]/15 text-[#26A69A] border border-[#26A69A]/40';
    }
    if (score >= 60) {
      return 'bg-[#2A2E39] text-white border border-[#363A45]';
    }
    return 'bg-[#0B0E11] text-[#787B86] border border-[#2A2E39]';
  };

  const getSeriesBadge = (series?: string, flag?: string) => {
    if (series === 'SM' || series === 'ST') {
      return (
        <span className="text-[9px] px-1 py-0.2 rounded bg-[#9C27B0]/15 text-[#BA68C8] border border-[#9C27B0]/30 font-mono font-bold" title="SME Platform Listing">
          SME
        </span>
      );
    }
    if (series === 'BE') {
      return (
        <span className="text-[9px] px-1 py-0.2 rounded bg-[#FF9800]/15 text-[#FFB74D] border border-[#FF9800]/30 font-mono font-bold" title="Trade-to-Trade (BE Series) - 100% Delivery Required">
          BE
        </span>
      );
    }
    if (series === 'BZ') {
      return (
        <span className="text-[9px] px-1 py-0.2 rounded bg-[#EF5350]/15 text-[#EF5350] border border-[#EF5350]/30 font-mono font-bold" title="Z-Group Surveillance">
          BZ
        </span>
      );
    }
    return (
      <span className="text-[9px] px-1 py-0.2 rounded bg-[#0B0E11] text-[#787B86] border border-[#2A2E39] font-mono" title="Regular Equity (EQ)">
        EQ
      </span>
    );
  };

  return (
    <div className="bg-[#151921] border border-[#2A2E39] rounded-none sm:rounded overflow-hidden">
      {/* Table Top Controls & Series Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-[#2A2E39] flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#151921]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            id="table-select-all-btn"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="inline-flex items-center gap-1.5 text-xs text-[#D1D4DC] hover:text-white transition-colors cursor-pointer"
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-[#26A69A]" />
            ) : (
              <Square className="h-4 w-4 text-[#787B86]" />
            )}
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {selectedSymbols.length > 0 ? `${selectedSymbols.length} Selected` : 'Select All'}
            </span>
          </button>

          <span className="text-xs text-[#2A2E39]">|</span>

          {/* Series segment quick-pill filter */}
          <div className="flex items-center gap-1 bg-[#0B0E11] p-0.5 rounded border border-[#2A2E39] text-[11px] font-mono">
            {['ALL', 'EQ', 'SME', 'BE', 'BZ'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeriesFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  seriesFilter === s
                    ? 'bg-[#2A2E39] text-white font-bold'
                    : 'text-[#787B86] hover:text-[#D1D4DC]'
                }`}
              >
                {s === 'ALL' ? 'All Series' : s === 'SME' ? 'SME Emerge' : `Series ${s}`}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#2A2E39] hidden sm:inline">|</span>

          <span className="text-[11px] font-mono text-[#787B86]">
            Showing <strong className="text-white">{sortedStocks.length}</strong> of {stocks.length} scanned
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-[#787B86] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-table-input"
              type="text"
              placeholder="Search symbol, ISIN, sector..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1 text-xs bg-[#0B0E11] border border-[#2A2E39] rounded text-white placeholder-[#787B86] font-mono focus:outline-none focus:border-[#26A69A]"
            />
          </div>

          {/* Page size dropdown */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs bg-[#0B0E11] border border-[#2A2E39] rounded text-[#D1D4DC] px-2 py-1 font-mono focus:outline-none focus:border-[#26A69A]"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#D1D4DC]">
          <thead className="bg-[#151921] text-[#787B86] uppercase tracking-wider font-semibold border-b border-[#2A2E39] text-[10px]">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-4 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stock & ISIN Master</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('currentPrice')}
                className="py-2.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>LTP (₹) & Chg</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('score')}
                className="py-2.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Score (100)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rsi14')}
                className="py-2.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>RSI (14)</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volumeSpikeRatio')}
                className="py-2.5 px-4 text-center cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Vol Spike</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-center">Trend & EMA Status</th>
              <th className="py-2.5 px-4">Detected Patterns & Quality</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2E39] font-sans">
            {paginatedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#787B86] text-xs font-mono">
                  No stocks match the current filter criteria.
                </td>
              </tr>
            ) : (
              paginatedStocks.map((stock) => {
                const isSelected = selectedSymbols.includes(stock.symbol);
                const isPositive = stock.priceChangePercent >= 0;

                return (
                  <tr
                    key={stock.symbol}
                    className={`hover:bg-[#1a1e27] transition-colors ${
                      isSelected ? 'bg-[#26A69A]/5' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelectSymbol(stock.symbol)}
                        className="text-[#787B86] hover:text-[#26A69A] cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-[#26A69A]" />
                        ) : (
                          <Square className="h-4 w-4 text-[#787B86]" />
                        )}
                      </button>
                    </td>

                    {/* Stock, ISIN & Series */}
                    <td className="py-2.5 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold text-white font-mono text-sm hover:text-[#26A69A] cursor-pointer transition-colors"
                            onClick={() => onOpenStockModal(stock)}
                          >
                            {stock.symbol}
                          </span>
                          {getSeriesBadge(stock.series, stock.dataQualityFlag)}
                          <span className="text-[9px] px-1 py-0.2 rounded bg-[#0B0E11] text-[#787B86] font-mono border border-[#2A2E39]">
                            {stock.exchange || 'NSE'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#787B86] truncate max-w-[180px] sm:max-w-xs" title={stock.name}>
                          {stock.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                          <span className="text-[#26A69A]">{stock.sector}</span>
                          {stock.isin && (
                            <span className="text-[#787B86] hidden sm:inline" title="ISIN Code">
                              • {stock.isin}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price & Change */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div
                        className={`inline-flex items-center gap-0.5 text-xs font-mono font-semibold ${
                          isPositive ? 'text-[#26A69A]' : 'text-[#EF5350]'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {stock.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>

                    {/* Opportunity Score */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${getScoreBadge(
                            stock.score
                          )}`}
                          title={stock.scoringReasons.join('\n')}
                        >
                          {stock.score}
                        </span>
                        <div className="text-[10px] font-mono text-[#787B86] mt-1 max-w-[100px] truncate" title={stock.scoringReasons[0]}>
                          {stock.scoringReasons[0] || 'Neutral'}
                        </div>
                      </div>
                    </td>

                    {/* RSI (14) */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="font-mono font-semibold text-xs text-white">
                          {stock.rsi14}
                        </span>
                        <div className="w-12 h-1 bg-[#2A2E39] rounded overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              stock.rsi14 > 70
                                ? 'bg-[#EF5350]'
                                : stock.rsi14 < 30
                                ? 'bg-[#26A69A]'
                                : 'bg-[#26A69A]'
                            }`}
                            style={{ width: `${Math.min(100, stock.rsi14)}%` }}
                          />
                        </div>
                        <div className="text-[9px] font-mono text-[#787B86] mt-0.5">
                          {stock.rsi14 > stock.prevRsi14 ? '↑ Rising' : '↓ Cooling'}
                        </div>
                      </div>
                    </td>

                    {/* Volume Spike Ratio */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 font-mono">
                        {stock.volumeSpikeRatio >= 1.5 && (
                          <Flame className="h-3 w-3 text-[#26A69A]" />
                        )}
                        <span
                          className={`font-semibold ${
                            stock.volumeSpikeRatio >= 1.5 ? 'text-[#26A69A]' : 'text-[#D1D4DC]'
                          }`}
                        >
                          {stock.volumeSpikeRatio}x
                        </span>
                      </div>
                      <div className="text-[9px] font-mono text-[#787B86]">
                        {stock.volumeSpikeRatio >= 1.5 ? 'Breakout' : 'Normal'}
                      </div>
                    </td>

                    {/* EMA Status */}
                    <td className="py-2.5 px-4 text-center font-mono">
                      {stock.aboveEma20 && stock.aboveEma50 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#26A69A]/15 text-[#26A69A] border border-[#26A69A]/30">
                          <CheckCircle className="h-3 w-3" /> 20&gt;50 EMA
                        </span>
                      ) : stock.aboveEma20 ? (
                        <span className="text-[10px] text-[#D1D4DC] bg-[#0B0E11] px-2 py-0.5 rounded border border-[#2A2E39]">
                          &gt; 20 EMA
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#787B86] bg-[#0B0E11] px-2 py-0.5 rounded border border-[#2A2E39]">
                          &lt; 20 EMA
                        </span>
                      )}
                    </td>

                    {/* Detected Patterns & Flags */}
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {stock.patterns.map((pat, pidx) => (
                          <span
                            key={pidx}
                            className="px-1.5 py-0.5 bg-[#0B0E11] border border-[#2A2E39] text-[#D1D4DC] text-[10px] font-mono rounded"
                          >
                            {pat}
                          </span>
                        ))}
                        {stock.dataQualityFlag && stock.dataQualityFlag !== 'Active (EQ)' && (
                          <span
                            className="px-1.5 py-0.5 bg-[#EF5350]/10 border border-[#EF5350]/20 text-[#EF5350] text-[9px] font-mono rounded"
                            title={stock.dataQualityFlag}
                          >
                            {stock.dataQualityFlag}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`stock-chart-btn-${stock.symbol}`}
                          onClick={() => onOpenStockModal(stock)}
                          className="p-1.5 rounded bg-[#0B0E11] hover:bg-[#2A2E39] text-[#D1D4DC] hover:text-white border border-[#2A2E39] transition-colors cursor-pointer"
                          title="Interactive Technical Chart"
                        >
                          <BarChart2 className="h-3.5 w-3.5 text-[#26A69A]" />
                        </button>
                        <button
                          id={`stock-ai-btn-${stock.symbol}`}
                          onClick={() => onAnalyzeStockAI(stock)}
                          className="p-1.5 rounded bg-[#26A69A]/15 hover:bg-[#26A69A]/25 text-[#26A69A] border border-[#26A69A]/30 transition-colors cursor-pointer"
                          title="Instant AI Opportunity Plan"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-[#26A69A]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedStocks.length > pageSize && (
        <div className="p-3 border-t border-[#2A2E39] bg-[#0B0E11] flex items-center justify-between text-xs text-[#787B86] font-mono">
          <div>
            Showing {(validPage - 1) * pageSize + 1} to{' '}
            {Math.min(validPage * pageSize, sortedStocks.length)} of {sortedStocks.length} entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage === 1}
              className="p-1.5 rounded border border-[#2A2E39] text-[#D1D4DC] hover:bg-[#2A2E39] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-white">
              Page {validPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage === totalPages}
              className="p-1.5 rounded border border-[#2A2E39] text-[#D1D4DC] hover:bg-[#2A2E39] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
