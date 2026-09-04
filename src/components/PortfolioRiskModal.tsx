import React, { useState } from 'react';
import {
  PieChart,
  Shield,
  Calculator,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  Trash2,
  RotateCcw,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  sector?: string;
  value?: number;
}

interface PortfolioAuditResult {
  diversificationScore: number;
  riskLevel: string;
  concentrationRisk: string;
  sectorRiskNote: string;
  strengths: string[];
  vulnerabilities: string[];
  rebalancingSuggestions: string[];
  plainLanguageSummary: string;
  totalPortfolioValue: number;
  enrichedHoldings: Array<{
    symbol: string;
    weight: number;
    value: number;
    sector: string;
    currentPrice: number;
  }>;
  sectorBreakdown: Record<string, number>;
}

interface PortfolioRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const PortfolioRiskModal: React.FC<PortfolioRiskModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'quiz' | 'calculators'>('holdings');

  // Holdings state
  const [holdings, setHoldings] = useState<Holding[]>([
    { symbol: 'RELIANCE', quantity: 25, avgPrice: 2850, sector: 'Energy / Conglomerate' },
    { symbol: 'HDFCBANK', quantity: 60, avgPrice: 1580, sector: 'Private Banking' },
    { symbol: 'TCS', quantity: 15, avgPrice: 4100, sector: 'IT Services' },
    { symbol: 'TATAMOTORS', quantity: 80, avgPrice: 980, sector: 'Automobile' },
    { symbol: 'HAL', quantity: 20, avgPrice: 4300, sector: 'Defence & Aerospace' },
  ]);

  const [newSymbol, setNewSymbol] = useState<string>('');
  const [newQty, setNewQty] = useState<number>(10);
  const [newPrice, setNewPrice] = useState<number>(1000);

  const [auditResult, setAuditResult] = useState<PortfolioAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);

  // Risk Quiz State
  const [quizAnswers, setQuizAnswers] = useState({
    horizon: 'medium', // short, medium, long
    drawdownTolerance: 'moderate', // low, moderate, high
    incomeGoal: 'growth', // income, balanced, growth
    experience: 'intermediate',
  });
  const [quizProfileResult, setQuizProfileResult] = useState<string | null>(null);

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState<number>(15000);
  const [sipRate, setSipRate] = useState<number>(14);
  const [sipYears, setSipYears] = useState<number>(10);

  if (!isOpen) return null;

  const handleAddHolding = () => {
    if (!newSymbol.trim()) return;
    setHoldings((prev) => [
      ...prev,
      {
        symbol: newSymbol.toUpperCase().trim(),
        quantity: Number(newQty) || 1,
        avgPrice: Number(newPrice) || 100,
      },
    ]);
    setNewSymbol('');
  };

  const handleRemoveHolding = (idx: number) => {
    setHoldings((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/portfolio-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings,
          riskProfile: quizProfileResult || 'moderate',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAuditResult(json);
      }
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  const calculateSIP = () => {
    const i = sipRate / 100 / 12;
    const n = sipYears * 12;
    const futureValue = sipMonthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = sipMonthly * n;
    const returns = futureValue - invested;
    return {
      invested: Math.round(invested),
      returns: Math.round(returns),
      total: Math.round(futureValue),
    };
  };

  const sipResult = calculateSIP();

  const handleCalculateQuizProfile = () => {
    if (quizAnswers.drawdownTolerance === 'low') {
      setQuizProfileResult('Conservative (Capital Preservation Focus)');
    } else if (quizAnswers.drawdownTolerance === 'high' && quizAnswers.horizon === 'long') {
      setQuizProfileResult('Aggressive (Maximum Alpha Compounder)');
    } else {
      setQuizProfileResult('Moderate (Balanced Growth & Risk Control)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#151921] border border-[#2A2E39] rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2A2E39] bg-[#0B0E11]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#26A69A]/15 text-[#26A69A]">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Portfolio Risk Audit & Investor Toolkit
                <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/30">
                  StockAnalyzer AI Parity
                </span>
              </h2>
              <p className="text-xs text-[#787B86]">
                Concentration risk auditor, diversification scoring, risk profile questionnaire, and wealth planners
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

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-3 bg-[#0B0E11] border-b border-[#2A2E39] text-xs font-mono">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'holdings'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            Holdings Risk Audit ({holdings.length})
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            Investor Risk Profile Quiz
          </button>
          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors cursor-pointer ${
              activeTab === 'calculators'
                ? 'bg-[#26A69A] text-black'
                : 'text-[#787B86] hover:text-[#D1D4DC]'
            }`}
          >
            SIP & Wealth Growth Calculators
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: HOLDINGS & AUDIT */}
          {activeTab === 'holdings' && (
            <div className="space-y-4">
              {/* Input row */}
              <div className="p-3 bg-[#0B0E11] rounded-lg border border-[#2A2E39] flex flex-wrap items-center gap-2 text-xs font-mono">
                <input
                  type="text"
                  placeholder="Stock Symbol (e.g. INFY)"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white text-xs w-36 uppercase focus:outline-none focus:border-[#26A69A]"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white text-xs w-20 focus:outline-none focus:border-[#26A69A]"
                />
                <input
                  type="number"
                  placeholder="Avg Price (₹)"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-[#151921] border border-[#2A2E39] rounded text-white text-xs w-28 focus:outline-none focus:border-[#26A69A]"
                />
                <button
                  onClick={handleAddHolding}
                  className="px-3 py-1.5 bg-[#26A69A] hover:bg-[#208b81] text-black font-bold rounded flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Stock
                </button>
                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing || holdings.length === 0}
                  className="ml-auto px-4 py-1.5 bg-[#4BA2FF] hover:bg-[#3587e2] text-black font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" /> {isAuditing ? 'Auditing with AI...' : 'Run Portfolio Risk Audit'}
                </button>
              </div>

              {/* Holdings Table */}
              <div className="overflow-x-auto border border-[#2A2E39] rounded bg-[#0B0E11]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-[#787B86] border-b border-[#2A2E39] bg-[#151921]">
                    <tr>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Sector</th>
                      <th className="p-2.5 text-right">Shares</th>
                      <th className="p-2.5 text-right">Avg Price</th>
                      <th className="p-2.5 text-right">Holding Value</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2E39]">
                    {holdings.map((h, i) => (
                      <tr key={i} className="hover:bg-[#151921]">
                        <td className="p-2.5 font-bold text-white">{h.symbol}</td>
                        <td className="p-2.5 text-[#787B86]">{h.sector || 'Equities'}</td>
                        <td className="p-2.5 text-right text-white">{h.quantity}</td>
                        <td className="p-2.5 text-right text-white">₹{h.avgPrice}</td>
                        <td className="p-2.5 text-right font-bold text-[#26A69A]">
                          ₹{(h.quantity * h.avgPrice).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            onClick={() => handleRemoveHolding(i)}
                            className="text-[#787B86] hover:text-[#EF5350] p-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Audit Report Card */}
              {auditResult && (
                <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#26A69A]/40 space-y-4">
                  {/* Top Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#151921] rounded border border-[#2A2E39] text-center">
                      <div className="text-[10px] font-mono text-[#787B86] uppercase">Diversification Score</div>
                      <div className="text-2xl font-bold font-mono text-[#26A69A] mt-1">
                        {auditResult.diversificationScore} / 100
                      </div>
                    </div>
                    <div className="p-3 bg-[#151921] rounded border border-[#2A2E39] text-center">
                      <div className="text-[10px] font-mono text-[#787B86] uppercase">Portfolio Risk Level</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">
                        {auditResult.riskLevel}
                      </div>
                    </div>
                    <div className="p-3 bg-[#151921] rounded border border-[#2A2E39] text-center">
                      <div className="text-[10px] font-mono text-[#787B86] uppercase">Total Evaluated Capital</div>
                      <div className="text-xl font-bold font-mono text-[#4BA2FF] mt-1">
                        ₹{auditResult.totalPortfolioValue?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3 bg-[#151921] rounded border border-[#2A2E39] text-xs text-[#D1D4DC] leading-relaxed">
                    <strong className="text-white font-mono block mb-1">AI Risk Summary:</strong>
                    {auditResult.plainLanguageSummary}
                  </div>

                  {/* Strengths & Vulnerabilities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#151921] rounded border border-[#26A69A]/30 space-y-1.5">
                      <span className="font-bold text-[#26A69A] flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Key Strengths
                      </span>
                      <ul className="list-disc list-inside text-[#D1D4DC] space-y-1">
                        {auditResult.strengths?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-[#151921] rounded border border-[#EF5350]/30 space-y-1.5">
                      <span className="font-bold text-[#EF5350] flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" /> Potential Vulnerabilities
                      </span>
                      <ul className="list-disc list-inside text-[#D1D4DC] space-y-1">
                        {auditResult.vulnerabilities?.map((v, idx) => (
                          <li key={idx}>{v}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Rebalancing Suggestions */}
                  <div className="p-3 bg-[#151921] rounded border border-[#2A2E39] space-y-1.5 text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#26A69A]" /> Rebalancing Action Plan
                    </span>
                    <ul className="list-decimal list-inside text-[#D1D4DC] space-y-1">
                      {auditResult.rebalancingSuggestions?.map((sug, idx) => (
                        <li key={idx}>{sug}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVESTOR QUIZ */}
          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto space-y-4 bg-[#0B0E11] p-5 rounded-lg border border-[#2A2E39]">
              <div className="border-b border-[#2A2E39] pb-3">
                <h3 className="text-sm font-bold text-white">Investor Risk Appetite Assessment</h3>
                <p className="text-xs text-[#787B86] mt-0.5">
                  Helps tune default filter presets, stop-loss tightness, and AI trading styles
                </p>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#D1D4DC] mb-1.5">1. What is your primary investment time horizon?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'short', label: 'Intraday to 2 Weeks' },
                      { id: 'medium', label: '1 to 6 Months (Swing)' },
                      { id: 'long', label: '1+ Years (Long-Term)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers((p) => ({ ...p, horizon: opt.id }))}
                        className={`p-2.5 rounded border text-center transition-colors cursor-pointer ${
                          quizAnswers.horizon === opt.id
                            ? 'bg-[#26A69A]/20 border-[#26A69A] text-[#26A69A] font-bold'
                            : 'bg-[#151921] border-[#2A2E39] text-[#787B86] hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#D1D4DC] mb-1.5">2. How would you react to a 10% portfolio pullback?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Panic / Exit Positions' },
                      { id: 'moderate', label: 'Review & Hold Core' },
                      { id: 'high', label: 'Buy More on Dip' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setQuizAnswers((p) => ({ ...p, drawdownTolerance: opt.id }))}
                        className={`p-2.5 rounded border text-center transition-colors cursor-pointer ${
                          quizAnswers.drawdownTolerance === opt.id
                            ? 'bg-[#26A69A]/20 border-[#26A69A] text-[#26A69A] font-bold'
                            : 'bg-[#151921] border-[#2A2E39] text-[#787B86] hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCalculateQuizProfile}
                  className="w-full py-2.5 bg-[#26A69A] hover:bg-[#208b81] text-black font-bold rounded uppercase tracking-wider text-xs cursor-pointer"
                >
                  Calculate My Risk Profile
                </button>

                {quizProfileResult && (
                  <div className="p-3.5 bg-[#151921] rounded border border-[#26A69A] text-center space-y-1">
                    <span className="text-[10px] text-[#787B86] uppercase">Assigned Investor Profile:</span>
                    <div className="text-sm font-bold text-[#26A69A]">{quizProfileResult}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CALCULATORS */}
          {activeTab === 'calculators' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SIP Calculator */}
              <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39] space-y-3 font-mono">
                <div className="border-b border-[#2A2E39] pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-[#26A69A]" /> Systematic Investment (SIP) Calculator
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[#787B86] mb-1">
                      <span>Monthly Investment (₹):</span>
                      <strong className="text-white">₹{sipMonthly.toLocaleString('en-IN')}</strong>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={100000}
                      step={1000}
                      value={sipMonthly}
                      onChange={(e) => setSipMonthly(Number(e.target.value))}
                      className="w-full accent-[#26A69A]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[#787B86] mb-1">
                      <span>Expected Annual Return (% CAGR):</span>
                      <strong className="text-white">{sipRate}%</strong>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={25}
                      step={0.5}
                      value={sipRate}
                      onChange={(e) => setSipRate(Number(e.target.value))}
                      className="w-full accent-[#26A69A]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[#787B86] mb-1">
                      <span>Investment Horizon (Years):</span>
                      <strong className="text-white">{sipYears} Years</strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={sipYears}
                      onChange={(e) => setSipYears(Number(e.target.value))}
                      className="w-full accent-[#26A69A]"
                    />
                  </div>

                  <div className="p-3 bg-[#151921] rounded border border-[#2A2E39] space-y-1.5 text-xs pt-3 mt-3">
                    <div className="flex justify-between text-[#787B86]">
                      <span>Total Invested Amount:</span>
                      <span className="text-white">₹{sipResult.invested.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[#787B86]">
                      <span>Estimated Wealth Gain:</span>
                      <span className="text-[#26A69A]">₹{sipResult.returns.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1 border-t border-[#2A2E39]">
                      <span>Future Maturity Value:</span>
                      <span className="text-sm text-[#4BA2FF]">₹{sipResult.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compounding Visual Summary */}
              <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2A2E39] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Power of Long-Term Compounding</h3>
                  <p className="text-xs text-[#787B86] leading-relaxed">
                    Disciplined equity compounders with low leverage and sustained ROCE generate exponential terminal returns over 10+ year horizons.
                  </p>
                </div>

                <div className="p-4 bg-[#151921] rounded border border-[#2A2E39] space-y-2 text-xs font-mono">
                  <div className="text-[#787B86]">Maturity Multiplier:</div>
                  <div className="text-3xl font-bold text-[#26A69A]">
                    {(sipResult.total / (sipResult.invested || 1)).toFixed(2)}x
                  </div>
                  <p className="text-[11px] text-[#787B86]">
                    Your wealth increases by{' '}
                    <strong className="text-white">
                      ₹{sipResult.returns.toLocaleString('en-IN')}
                    </strong>{' '}
                    purely via compounding interest at {sipRate}% CAGR.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0B0E11] border-t border-[#2A2E39] flex items-center justify-between text-[11px] font-mono text-[#787B86]">
          <span>Risk scores computed using modern portfolio variance & sector weights.</span>
          <span className="text-[#26A69A]">Instant Audit Ready</span>
        </div>
      </div>
    </div>
  );
};
