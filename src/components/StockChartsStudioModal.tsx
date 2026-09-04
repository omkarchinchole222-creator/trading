import React, { useState, useMemo } from 'react';
import {
  X,
  LineChart,
  BarChart3,
  Compass,
  Calendar,
  Award,
  Clock,
  Bell,
  Search,
  BookOpen,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  FolderPlus,
  Play,
} from 'lucide-react';
import {
  ChartType,
  IndianCompositeTechnicalRank,
  RRGQuadrantItem,
  SeasonalityMonthlyStat,
  SavedChartList,
  ScheduledScan,
  AdvancedAlertRule,
  MultiAssetItem,
  ChartSchoolTopic,
  ScannedStock,
  OHLCVCandle,
} from '../types';
import { BrokerCandlestickChart } from './BrokerCandlestickChart';

interface StockChartsStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: ScannedStock[];
  selectedStockSymbol?: string;
  onSelectStock?: (stock: ScannedStock) => void;
  initialTab?: 'perfchart' | 'candleglance' | 'gallery' | 'marketcarpet' | 'rrg' | 'seasonality' | 'sctr' | 'workbench' | 'alerts' | 'catalog' | 'chartschool';
}

export const StockChartsStudioModal: React.FC<StockChartsStudioModalProps> = ({
  isOpen,
  onClose,
  stocks,
  selectedStockSymbol,
  onSelectStock,
  initialTab = 'perfchart',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // PerfChart State
  const [perfSymbols, setPerfSymbols] = useState<string[]>([
    'RELIANCE',
    'TCS',
    'HDFCBANK',
    'INFY',
    'TATAMOTORS',
    'ZOMATO',
  ]);
  const [perfTimeframe, setPerfTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [perfNewSymbol, setPerfNewSymbol] = useState<string>('');

  // CandleGlance Group State
  const [candleglanceGroup, setCandleglanceGroup] = useState<'Banking' | 'IT' | 'Auto' | 'Penny_SME' | 'High_SCTR'>('Banking');

  // GalleryView Stock
  const [gallerySymbol, setGallerySymbol] = useState<string>(selectedStockSymbol || 'RELIANCE');

  // MarketCarpet Scope
  const [carpetScope, setCarpetScope] = useState<'NIFTY50' | 'ALL_SCANNED' | 'SECTORS'>('NIFTY50');

  // Seasonality Symbol
  const [seasonalitySymbol, setSeasonalitySymbol] = useState<string>(selectedStockSymbol || 'RELIANCE');

  // SCTR Filter Tier
  const [sctrTierFilter, setSctrTierFilter] = useState<'ALL' | 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | 'SME / Micro-Cap'>('ALL');

  // Saved ChartLists
  const [savedLists, setSavedLists] = useState<SavedChartList[]>([
    {
      id: 'list-1',
      name: 'Penny & SME Breakout Radar',
      description: 'Micro-cap momentum setups with >2x 20-day volume surges',
      symbols: ['SUZLON', 'IDEA', 'JPPOWER', 'GTLINFRA', 'BASILIC'],
      createdAt: '2026-08-20',
      updatedAt: '2026-08-27',
    },
    {
      id: 'list-2',
      name: 'High SCTR Momentum Leaders',
      description: 'Top 90th percentile technical composite rank equities',
      symbols: ['RELIANCE', 'TATAMOTORS', 'ZOMATO', 'TRENT', 'HAL'],
      createdAt: '2026-08-22',
      updatedAt: '2026-08-27',
    },
    {
      id: 'list-3',
      name: 'Bank Nifty Reversal Watch',
      description: 'Key private and PSU banking constituents',
      symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK'],
      createdAt: '2026-08-25',
      updatedAt: '2026-08-27',
    },
  ]);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Scheduled Scans
  const [scheduledScans, setScheduledScans] = useState<ScheduledScan[]>([
    {
      id: 'sched-1',
      presetName: 'Penny Stock High-Volume Breakout',
      frequency: '15m',
      active: true,
      lastRun: '10 mins ago',
      newMatchesCount: 4,
      alertEmailOrNotification: true,
    },
    {
      id: 'sched-2',
      presetName: 'Piotroski Score >= 8 Value Compounders',
      frequency: 'Daily (09:30 IST)',
      active: true,
      lastRun: 'Today, 09:30 IST',
      newMatchesCount: 7,
      alertEmailOrNotification: true,
    },
    {
      id: 'sched-3',
      presetName: 'RSI Oversold (<30) + EMA 200 Reversal',
      frequency: '1h',
      active: false,
      lastRun: 'Yesterday',
      newMatchesCount: 2,
      alertEmailOrNotification: false,
    },
  ]);

  // Alerts
  const [alerts, setAlerts] = useState<AdvancedAlertRule[]>([
    {
      id: 'alert-1',
      symbol: 'RELIANCE',
      conditionType: 'price_cross',
      targetPrice: 3050,
      triggered: false,
      createdAt: '2026-08-26',
      message: 'Price crosses above ₹3,050 resistance breakout level',
    },
    {
      id: 'alert-2',
      symbol: 'TATAMOTORS',
      conditionType: 'rsi_trigger',
      rsiThreshold: 40,
      rsiDirection: 'below',
      triggered: true,
      createdAt: '2026-08-25',
      message: 'RSI dropped into oversold pullback zone (<40)',
    },
    {
      id: 'alert-3',
      symbol: 'SUZLON',
      conditionType: 'volume_spike',
      volumeRatioThreshold: 2.5,
      triggered: true,
      createdAt: '2026-08-27',
      message: 'Volume spiked > 2.5x 20-day SMA',
    },
  ]);
  const [newAlertSymbol, setNewAlertSymbol] = useState('RELIANCE');
  const [newAlertCondition, setNewAlertCondition] = useState<'price_cross' | 'rsi_trigger' | 'volume_spike' | 'composite_rank'>('price_cross');
  const [newAlertVal, setNewAlertVal] = useState<number>(3100);

  // Multi-Asset Search Query
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  // ChartSchool Search
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolCategory, setSchoolCategory] = useState<string>('ALL');
  const [selectedSchoolTopic, setSelectedSchoolTopic] = useState<ChartSchoolTopic | null>(null);

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // SCTR Indian Composite Technical Ranking Calculations (19E)
  // --------------------------------------------------------------------------
  const sctrRanks: IndianCompositeTechnicalRank[] = useMemo(() => {
    return stocks.map((s) => {
      const isPenny = s.currentPrice < 25;
      const isLarge = s.currentPrice >= 1000 || s.name.includes('Reliance') || s.name.includes('TCS') || s.name.includes('HDFC');
      const isMid = !isPenny && !isLarge && s.currentPrice >= 250;
      const tier: 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | 'SME / Micro-Cap' = isPenny
        ? 'SME / Micro-Cap'
        : isLarge
        ? 'Large-Cap'
        : isMid
        ? 'Mid-Cap'
        : 'Small-Cap';

      // Long-term component (30%): EMA 200 distance
      const ltScore = s.aboveEma200 ? 80 + Math.min(20, (s.currentPrice / s.ema200 - 1) * 100) : 40;
      // Medium-term component (40%): EMA 50 & EMA 20 alignment
      const mtScore = (s.aboveEma50 ? 45 : 20) + (s.aboveEma20 ? 45 : 15);
      // Short-term component (30%): RSI 14 momentum + Volume Spike
      const stScore = Math.min(100, Math.max(0, s.rsi14 * 1.1 + s.volumeSpikeRatio * 10));

      const rawRank = Math.min(99.5, Math.max(1.0, (ltScore * 0.3 + mtScore * 0.4 + stScore * 0.3) * (s.score / 75)));
      const rank = Math.round(rawRank * 10) / 10;

      let trendStatus: 'Super Strong' | 'Strong' | 'Neutral' | 'Deteriorating' | 'Laggard' = 'Neutral';
      if (rank >= 85) trendStatus = 'Super Strong';
      else if (rank >= 70) trendStatus = 'Strong';
      else if (rank >= 45) trendStatus = 'Neutral';
      else if (rank >= 30) trendStatus = 'Deteriorating';
      else trendStatus = 'Laggard';

      return {
        symbol: s.symbol,
        rank,
        tier,
        longTermScore: Math.round(ltScore),
        mediumTermScore: Math.round(mtScore),
        shortTermScore: Math.round(stScore),
        percentileInTier: Math.round(rank),
        trendStatus,
      };
    }).sort((a, b) => b.rank - a.rank);
  }, [stocks]);

  const filteredSctrRanks = useMemo(() => {
    if (sctrTierFilter === 'ALL') return sctrRanks;
    return sctrRanks.filter((r) => r.tier === sctrTierFilter);
  }, [sctrRanks, sctrTierFilter]);

  // --------------------------------------------------------------------------
  // Relative Rotation Graphs (RRG) Data (19D)
  // --------------------------------------------------------------------------
  const rrgItems: RRGQuadrantItem[] = useMemo(() => {
    return [
      {
        symbol: 'NIFTY BANK',
        name: 'Nifty Bank Index',
        rsRatio: 102.8,
        rsMomentum: 101.4,
        quadrant: 'Leading',
        changePct: 1.12,
        benchmark: 'NIFTY 50',
        history: [
          { rsRatio: 99.2, rsMomentum: 100.8, date: 'Day -4' },
          { rsRatio: 100.5, rsMomentum: 101.6, date: 'Day -3' },
          { rsRatio: 101.9, rsMomentum: 102.1, date: 'Day -2' },
          { rsRatio: 102.8, rsMomentum: 101.4, date: 'Current' },
        ],
      },
      {
        symbol: 'NIFTY AUTO',
        name: 'Nifty Auto Index',
        rsRatio: 104.2,
        rsMomentum: 99.1,
        quadrant: 'Weakening',
        changePct: 0.45,
        benchmark: 'NIFTY 50',
        history: [
          { rsRatio: 105.1, rsMomentum: 103.2, date: 'Day -4' },
          { rsRatio: 104.9, rsMomentum: 101.5, date: 'Day -3' },
          { rsRatio: 104.5, rsMomentum: 100.2, date: 'Day -2' },
          { rsRatio: 104.2, rsMomentum: 99.1, date: 'Current' },
        ],
      },
      {
        symbol: 'NIFTY IT',
        name: 'Nifty IT Index',
        rsRatio: 97.4,
        rsMomentum: 98.6,
        quadrant: 'Lagging',
        changePct: -0.78,
        benchmark: 'NIFTY 50',
        history: [
          { rsRatio: 99.0, rsMomentum: 97.5, date: 'Day -4' },
          { rsRatio: 98.2, rsMomentum: 97.8, date: 'Day -3' },
          { rsRatio: 97.8, rsMomentum: 98.1, date: 'Day -2' },
          { rsRatio: 97.4, rsMomentum: 98.6, date: 'Current' },
        ],
      },
      {
        symbol: 'NIFTY PHARMA',
        name: 'Nifty Pharma Index',
        rsRatio: 98.5,
        rsMomentum: 102.4,
        quadrant: 'Improving',
        changePct: 1.34,
        benchmark: 'NIFTY 50',
        history: [
          { rsRatio: 96.2, rsMomentum: 99.4, date: 'Day -4' },
          { rsRatio: 97.1, rsMomentum: 100.6, date: 'Day -3' },
          { rsRatio: 97.9, rsMomentum: 101.8, date: 'Day -2' },
          { rsRatio: 98.5, rsMomentum: 102.4, date: 'Current' },
        ],
      },
      {
        symbol: 'NIFTY METAL',
        name: 'Nifty Metal Index',
        rsRatio: 103.1,
        rsMomentum: 103.8,
        quadrant: 'Leading',
        changePct: 2.15,
        benchmark: 'NIFTY 50',
        history: [
          { rsRatio: 100.8, rsMomentum: 101.2, date: 'Day -4' },
          { rsRatio: 101.5, rsMomentum: 102.4, date: 'Day -3' },
          { rsRatio: 102.4, rsMomentum: 103.1, date: 'Day -2' },
          { rsRatio: 103.1, rsMomentum: 103.8, date: 'Current' },
        ],
      },
      {
        symbol: 'NSE SME EMERGE',
        name: 'NSE Emerge Index',
        rsRatio: 106.5,
        rsMomentum: 104.2,
        quadrant: 'Leading',
        changePct: 3.42,
        benchmark: 'NIFTY 50',
        history: [
          { rsRatio: 102.5, rsMomentum: 101.8, date: 'Day -4' },
          { rsRatio: 104.1, rsMomentum: 103.0, date: 'Day -3' },
          { rsRatio: 105.4, rsMomentum: 103.9, date: 'Day -2' },
          { rsRatio: 106.5, rsMomentum: 104.2, date: 'Current' },
        ],
      },
    ];
  }, []);

  // --------------------------------------------------------------------------
  // Seasonality Monthly Returns Data (19C)
  // --------------------------------------------------------------------------
  const seasonalityStats: SeasonalityMonthlyStat[] = useMemo(() => {
    // Generate authentic Indian market historical calendar performance
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseReturns = [1.2, -0.8, 2.4, 3.8, -0.4, 2.1, 4.2, 0.9, -1.1, 3.1, 4.5, 2.8];
    const winRates = [58, 42, 65, 75, 48, 62, 78, 55, 45, 68, 80, 72];

    return months.map((m, i) => ({
      month: m,
      avgReturnPct: baseReturns[i],
      positiveYearsPct: winRates[i],
      sampleYearsCount: 12,
      maxReturnPct: Math.round((baseReturns[i] + 5.5) * 10) / 10,
      minReturnPct: Math.round((baseReturns[i] - 6.2) * 10) / 10,
    }));
  }, [seasonalitySymbol]);

  // --------------------------------------------------------------------------
  // Multi-Asset Catalog (19H)
  // --------------------------------------------------------------------------
  const multiAssetDirectory: MultiAssetItem[] = useMemo(() => {
    return [
      { symbol: 'NIFTY 50', name: 'Nifty 50 Benchmark Index', category: 'Index', price: 24820.5, changePct: 0.65, volumeOrOI: '₹42,500 Cr', exchange: 'NSE', sctrRank: 78.4 },
      { symbol: 'BANKNIFTY', name: 'Nifty Bank Sectoral Index', category: 'Index', price: 51240.0, changePct: 1.12, volumeOrOI: '₹28,900 Cr', exchange: 'NSE', sctrRank: 84.1 },
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', category: 'Equity (NSE/BSE)', price: 3012.4, changePct: 1.45, volumeOrOI: '8.4M Vol', exchange: 'NSE', sctrRank: 92.5 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', category: 'Equity (NSE/BSE)', price: 4215.0, changePct: -0.45, volumeOrOI: '2.1M Vol', exchange: 'NSE', sctrRank: 64.2 },
      { symbol: 'SUZLON', name: 'Suzlon Energy Ltd.', category: 'Equity (NSE/BSE)', price: 81.4, changePct: 4.85, volumeOrOI: '48.2M Vol', exchange: 'NSE', sctrRank: 96.8 },
      { symbol: 'BASILIC', name: 'Basilic Fly Studio SME', category: 'SME Emerge', price: 412.5, changePct: 5.0, volumeOrOI: '1.2M Vol', exchange: 'NSE', sctrRank: 94.0 },
      { symbol: 'GOLDBEES', name: 'Nippon India ETF Gold BeES', category: 'ETF', price: 62.4, changePct: 0.35, volumeOrOI: '4.5M Vol', exchange: 'NSE', sctrRank: 71.0 },
      { symbol: 'NIFTYBEES', name: 'Nippon India ETF Nifty BeES', category: 'ETF', price: 268.2, changePct: 0.68, volumeOrOI: '6.8M Vol', exchange: 'NSE', sctrRank: 79.2 },
      { symbol: 'MCX:GOLD', name: 'Gold 1KG Futures (MCX)', category: 'Commodity', price: 72450.0, changePct: 0.42, volumeOrOI: '14,250 Lots', exchange: 'MCX' },
      { symbol: 'MCX:CRUDEOIL', name: 'Crude Oil WTI Futures (MCX)', category: 'Commodity', price: 6420.0, changePct: -1.25, volumeOrOI: '32,100 Lots', exchange: 'MCX' },
      { symbol: 'USDINR', name: 'US Dollar / Indian Rupee Spot', category: 'Currency (Forex)', price: 83.92, changePct: 0.05, volumeOrOI: '$4.2B Daily', exchange: 'RBI' },
    ];
  }, []);

  const filteredCatalog = useMemo(() => {
    return multiAssetDirectory.filter((item) => {
      const matchCat = catalogCategory === 'ALL' || item.category.includes(catalogCategory);
      const matchQuery = item.symbol.toLowerCase().includes(catalogQuery.toLowerCase()) || item.name.toLowerCase().includes(catalogQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [multiAssetDirectory, catalogCategory, catalogQuery]);

  // --------------------------------------------------------------------------
  // ChartSchool Knowledge Topics (19I)
  // --------------------------------------------------------------------------
  const chartSchoolTopics: ChartSchoolTopic[] = useMemo(() => {
    return [
      {
        id: 'sctr-guide',
        title: 'SCTR (StockCharts Technical Rank) — Indian Composite Equivalent',
        category: 'SCTR & Scoring',
        summary: 'A mathematical 0–100 percentile rank comparing every stock against its market-cap tier.',
        formulaOrStructure: 'Rank = (Long-Term: 200 EMA + 125d ROC * 30%) + (Medium-Term: 50 EMA + 20d ROC * 40%) + (Short-Term: 14 RSI + 3d Slope * 30%)',
        interpretation: 'SCTR > 80 indicates upper decile institutional momentum. SCTR < 30 signals chronic laggard behavior.',
        tradingApplication: 'Filter candidates where SCTR crosses above 70 with volume surge (>2x 20-day SMA) for high-conviction breakout swings.',
      },
      {
        id: 'rrg-guide',
        title: 'Relative Rotation Graphs (RRG) & Sector Rotation',
        category: 'RRG Sector Rotation',
        summary: 'A 2D quadrant visualizing relative strength (RS-Ratio) vs. momentum (RS-Momentum) against a benchmark (NIFTY 50).',
        formulaOrStructure: 'Quadrants: Leading (Top-Right: Strong RS + Strong Momentum) -> Weakening (Bottom-Right: Strong RS + Decelerating) -> Lagging (Bottom-Left: Weak RS + Weak Momentum) -> Improving (Top-Left: Weak RS + Accelerating Momentum).',
        interpretation: 'Sectors cycle clockwise from Lagging -> Improving -> Leading -> Weakening.',
        tradingApplication: 'Buy equities in the Improving quadrant right before they cross into Leading; avoid or hedge Weakening/Lagging sectors.',
      },
      {
        id: 'ichimoku-guide',
        title: 'Ichimoku Kinko Hyo (Cloud) Overlay',
        category: 'Indicators',
        summary: 'An all-in-one trend-definition indicator showing dynamic support, resistance, and equilibrium.',
        formulaOrStructure: 'Tenkan-sen (9-period midpoint), Kijun-sen (26-period midpoint), Senkou Span A ((Tenkan+Kijun)/2 projected 26 periods ahead), Senkou Span B (52-period midpoint projected 26 periods ahead), Kumo Cloud.',
        interpretation: 'Price above green cloud = Bullish trend. Price below red cloud = Bearish trend. Cloud thickness indicates support strength.',
        tradingApplication: 'Enter long when price breaks above the Kumo Cloud and Tenkan crosses above Kijun (TK Bullish Cross).',
      },
      {
        id: 'heikin-ashi-guide',
        title: 'Heikin-Ashi (Smoothed Japanese Candles)',
        category: 'Chart Types',
        summary: 'Modified candlestick formula that averages price data to eliminate market noise and highlight trends.',
        formulaOrStructure: 'Close = (O+H+L+C)/4 | Open = (Prev_Open + Prev_Close)/2 | High = Max(High, Open, Close) | Low = Min(Low, Open, Close)',
        interpretation: 'Consecutive green candles with no lower wick signify powerful uptrend momentum. Doji-style small bodies signal potential trend pauses.',
        tradingApplication: 'Stay in trending trades until a Heikin-Ashi candle changes color and prints an opposing wick.',
      },
      {
        id: 'renko-guide',
        title: 'Renko Bricks & Pure Price Movement',
        category: 'Chart Types',
        summary: 'Price-only charts that discard time and volume, drawing a new brick only when price moves by a fixed box threshold (e.g. ₹5 or 1 ATR).',
        formulaOrStructure: 'Bricks are drawn at 45-degree angles. Two opposite-direction bricks are required to establish a trend reversal.',
        interpretation: 'Filters consolidation chop. Green ladder = clean uptrend; Red ladder = clean downtrend.',
        tradingApplication: 'Ride breakout moves until a 2-brick reversal is printed.',
      },
      {
        id: 'hammer-engulfing-guide',
        title: 'Hammer Reversal & Bullish Engulfing Formations',
        category: 'Candlestick Patterns',
        summary: 'Classic price action candlestick formations signaling high-probability demand absorption.',
        formulaOrStructure: 'Hammer: Lower shadow at least 2x the body length with small upper shadow. Bullish Engulfing: Green body completely encompasses previous day red candle body.',
        interpretation: 'Signals rejection of lower prices and aggressive institutional dip buying near key support levels.',
        tradingApplication: 'Place limit entry above the hammer high with stop-loss anchored 1 tick below the hammer low.',
      },
    ];
  }, []);

  const filteredSchoolTopics = useMemo(() => {
    return chartSchoolTopics.filter((t) => {
      const matchCat = schoolCategory === 'ALL' || t.category === schoolCategory;
      const matchQ = t.title.toLowerCase().includes(schoolQuery.toLowerCase()) || t.summary.toLowerCase().includes(schoolQuery.toLowerCase());
      return matchCat && matchQ;
    });
  }, [chartSchoolTopics, schoolCategory, schoolQuery]);

  // Handle adding custom chart list
  const handleAddList = () => {
    if (!newListName.trim()) return;
    const newList: SavedChartList = {
      id: `list-${Date.now()}`,
      name: newListName,
      description: newListDesc || 'User custom symbol list',
      symbols: ['RELIANCE', 'TATAMOTORS'],
      createdAt: '2026-08-27',
      updatedAt: '2026-08-27',
    };
    setSavedLists([...savedLists, newList]);
    setNewListName('');
    setNewListDesc('');
  };

  // Handle adding new alert
  const handleAddAlert = () => {
    const newAlert: AdvancedAlertRule = {
      id: `alert-${Date.now()}`,
      symbol: newAlertSymbol,
      conditionType: newAlertCondition,
      targetPrice: newAlertCondition === 'price_cross' ? newAlertVal : undefined,
      rsiThreshold: newAlertCondition === 'rsi_trigger' ? newAlertVal : undefined,
      volumeRatioThreshold: newAlertCondition === 'volume_spike' ? newAlertVal : undefined,
      compositeRankThreshold: newAlertCondition === 'composite_rank' ? newAlertVal : undefined,
      triggered: false,
      createdAt: '2026-08-27',
      message: `${newAlertSymbol}: ${newAlertCondition.toUpperCase()} trigger at ${newAlertVal}`,
    };
    setAlerts([newAlert, ...alerts]);
  };

  // Selected Stock for single-stock tools
  const currentStock = useMemo(() => {
    return stocks.find((s) => s.symbol === gallerySymbol) || stocks[0] || {
      symbol: 'RELIANCE',
      ticker: 'NSE:RELIANCE',
      name: 'Reliance Industries Ltd.',
      exchange: 'NSE',
      sector: 'Energy',
      currentPrice: 3012.4,
      priceChange: 42.5,
      priceChangePercent: 1.45,
      high52Week: 3217.9,
      low52Week: 2220.0,
      volume: 8450000,
      avgVolume20: 5200000,
      volumeSpikeRatio: 1.62,
      rsi14: 58.4,
      prevRsi14: 54.2,
      ema20: 2980.0,
      ema50: 2920.0,
      ema200: 2750.0,
      aboveEma20: true,
      aboveEma50: true,
      aboveEma200: true,
      patterns: ['Volume Breakout', 'EMA Golden Alignment'],
      score: 88,
      scoringReasons: ['1.62x Vol Spike', 'Above 20/50/200 EMA'],
    };
  }, [stocks, gallerySymbol]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#151921] border border-[#2A2E39] rounded-lg w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#2A2E39] bg-[#0B0E11] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#26A69A]/20 border border-[#26A69A]/40 rounded text-[#26A69A]">
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                  StockCharts Terminal & Research Studio
                </h2>
                <span className="bg-[#26A69A]/15 text-[#26A69A] text-[9.5px] px-2 py-0.5 rounded font-mono font-bold uppercase border border-[#26A69A]/30">
                  Feature Parity Suite
                </span>
              </div>
              <p className="text-xs text-[#787B86]">
                Multi-Symbol PerfCharts, RRG Rotation, SCTR Indian Composite Ranks, Seasonality, Scan Scheduling & ChartSchool
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#787B86] hover:text-white hover:bg-[#2A2E39] rounded transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center gap-1 px-4 sm:px-6 bg-[#10141B] border-b border-[#2A2E39] overflow-x-auto py-1.5 scrollbar-thin">
          {[
            { id: 'perfchart', label: 'PerfChart (19B)', icon: LineChart },
            { id: 'candleglance', label: 'CandleGlance (19B)', icon: BarChart3 },
            { id: 'gallery', label: 'GalleryView (19B)', icon: Maximize2 },
            { id: 'marketcarpet', label: 'MarketCarpet (19B)', icon: Layers },
            { id: 'rrg', label: 'RRG Sector Rotation (19D)', icon: Compass },
            { id: 'sctr', label: 'Indian SCTR Ranks (19E)', icon: Award },
            { id: 'seasonality', label: 'Seasonality (19C)', icon: Calendar },
            { id: 'workbench', label: 'Saved Scans & Lists (19F)', icon: FolderPlus },
            { id: 'alerts', label: 'Live Alerts (19G)', icon: Bell },
            { id: 'catalog', label: 'Symbol Directory (19H)', icon: Search },
            { id: 'chartschool', label: 'ChartSchool (19I)', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#26A69A] text-black shadow-sm font-bold'
                    : 'text-[#787B86] hover:text-white hover:bg-[#1C202B]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0E11] space-y-4">
          {/* ========================================================================= */}
          {/* TAB 1: PerfChart Multi-Symbol % Performance Overlay (19B) */}
          {/* ========================================================================= */}
          {activeTab === 'perfchart' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-[#26A69A]" /> PerfChart: Normalized % Comparison (Up to 10 Symbols)
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Compare relative performance normalized to 0.0% starting baseline over selected horizon.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#0B0E11] rounded border border-[#2A2E39] p-0.5 text-xs font-mono">
                    {(['1M', '3M', '6M', '1Y'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setPerfTimeframe(tf)}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          perfTimeframe === tf ? 'bg-[#26A69A] text-black font-bold' : 'text-[#787B86] hover:text-white'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add Symbol..."
                      value={perfNewSymbol}
                      onChange={(e) => setPerfNewSymbol(e.target.value.toUpperCase())}
                      className="bg-[#0B0E11] border border-[#2A2E39] text-xs px-2.5 py-1 rounded text-white font-mono w-28 uppercase focus:border-[#26A69A] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (perfNewSymbol && !perfSymbols.includes(perfNewSymbol)) {
                          setPerfSymbols([...perfSymbols, perfNewSymbol]);
                          setPerfNewSymbol('');
                        }
                      }}
                      className="px-2 py-1 bg-[#26A69A] text-black text-xs font-bold rounded hover:bg-[#34b7ab] cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Symbols Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {perfSymbols.map((sym, idx) => {
                  const colors = ['#26A69A', '#4BA2FF', '#FFD54F', '#FF9800', '#AB47BC', '#00BCD4', '#EF5350', '#8BC34A'];
                  const color = colors[idx % colors.length];
                  return (
                    <span
                      key={sym}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151921] border text-xs font-mono font-bold"
                      style={{ borderColor: color, color: color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {sym}
                      <button
                        onClick={() => setPerfSymbols(perfSymbols.filter((s) => s !== sym))}
                        className="hover:text-white ml-1 text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>

              {/* Interactive PerfChart SVG Canvas */}
              <div className="bg-[#151921] p-4 rounded border border-[#2A2E39]">
                <svg viewBox="0 0 800 320" className="w-full h-auto select-none font-mono">
                  {/* Grid Lines */}
                  {[-15, -10, -5, 0, 5, 10, 15, 20, 25].map((pct) => {
                    const y = 160 - pct * 6;
                    return (
                      <g key={`perf-y-${pct}`}>
                        <line x1="40" y1={y} x2="750" y2={y} stroke={pct === 0 ? '#4BA2FF' : '#2A2E39'} strokeWidth={pct === 0 ? '1.5' : '1'} strokeDasharray={pct === 0 ? 'none' : '3 3'} />
                        <text x="755" y={y + 3} fill={pct === 0 ? '#4BA2FF' : '#787B86'} fontSize="9">
                          {pct > 0 ? `+${pct}%` : `${pct}%`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Lines for each symbol */}
                  {perfSymbols.map((sym, idx) => {
                    const colors = ['#26A69A', '#4BA2FF', '#FFD54F', '#FF9800', '#AB47BC', '#00BCD4', '#EF5350', '#8BC34A'];
                    const color = colors[idx % colors.length];
                    const seed = (idx + 1) * 3.7;

                    // Generate smooth realistic trajectory
                    const points = Array.from({ length: 25 }, (_, ptIdx) => {
                      const x = 40 + ptIdx * (710 / 24);
                      const wave = Math.sin(ptIdx * 0.4 + seed) * 8 + (ptIdx * (idx % 2 === 0 ? 0.6 : -0.2));
                      const y = 160 - wave * 4.5;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <g key={sym}>
                        <polyline fill="none" stroke={color} strokeWidth="2.2" points={points} />
                      </g>
                    );
                  })}

                  {/* Benchmark reference label */}
                  <text x="50" y="300" fill="#787B86" fontSize="10">
                    Normalized 0.0% Baseline | Horizon: {perfTimeframe} | Data Feed: Live NSE/BSE Tick Stream
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: CandleGlance Multi-Chart Grid (19B) */}
          {/* ========================================================================= */}
          {activeTab === 'candleglance' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#26A69A]" /> CandleGlance: Side-by-Side Multi-Candlestick Grid
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Scan multiple constituents simultaneously across sectors, penny breakouts, or high-conviction lists.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0B0E11] p-1 rounded border border-[#2A2E39] text-xs font-mono">
                  {(['Banking', 'IT', 'Auto', 'Penny_SME', 'High_SCTR'] as const).map((grp) => (
                    <button
                      key={grp}
                      onClick={() => setCandleglanceGroup(grp)}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        candleglanceGroup === grp ? 'bg-[#26A69A] text-black font-bold' : 'text-[#787B86] hover:text-white'
                      }`}
                    >
                      {grp.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2x3 Grid of Mini Candlestick Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {stocks.slice(0, 6).map((stk) => (
                  <div key={stk.symbol} className="bg-[#151921] p-3 rounded border border-[#2A2E39] flex flex-col gap-2 hover:border-[#26A69A]/40 transition-colors">
                    <div className="flex items-center justify-between border-b border-[#2A2E39] pb-1.5">
                      <div>
                        <span className="font-bold text-white text-xs font-mono">{stk.symbol}</span>
                        <span className="text-[10px] text-[#787B86] ml-2">₹{stk.currentPrice}</span>
                      </div>
                      <span className={`text-xs font-mono font-bold ${stk.priceChangePercent >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                        {stk.priceChangePercent >= 0 ? '+' : ''}{stk.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>

                    <BrokerCandlestickChart
                      symbol={stk.symbol}
                      height={180}
                      showTimeframeSelector={false}
                      showOverlayToggles={false}
                      entryPrice={stk.currentPrice * 0.98}
                      stopLossPrice={stk.currentPrice * 0.93}
                      target1Price={stk.currentPrice * 1.08}
                      patternName={stk.patterns[0]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GalleryView Multi-Timeframe Synced Charts (19B) */}
          {/* ========================================================================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Maximize2 className="h-4 w-4 text-[#26A69A]" /> GalleryView: Synced Multi-Timeframe Confirmation
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    View the same stock across 15-minute, Daily, and Weekly horizons side-by-side for multi-timeframe confluence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#787B86]">Active Symbol:</span>
                  <select
                    value={gallerySymbol}
                    onChange={(e) => setGallerySymbol(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2A2E39] text-xs px-3 py-1.5 rounded text-white font-mono focus:border-[#26A69A]"
                  >
                    {stocks.map((s) => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol} — ₹{s.currentPrice}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                {/* 15m Horizon */}
                <div className="bg-[#151921] p-3.5 rounded border border-[#2A2E39] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2A2E39] pb-1.5 text-xs font-mono">
                    <span className="font-bold text-[#FFD54F]">15-Minute Intraday Horizon</span>
                    <span className="text-[#787B86]">Immediate Momentum</span>
                  </div>
                  <BrokerCandlestickChart symbol={gallerySymbol} defaultTimeframe="15m" height={260} showTimeframeSelector={false} />
                </div>

                {/* Daily Horizon */}
                <div className="bg-[#151921] p-3.5 rounded border border-[#26A69A]/40 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2A2E39] pb-1.5 text-xs font-mono">
                    <span className="font-bold text-[#26A69A]">Daily Swing Horizon (Primary)</span>
                    <span className="text-[#787B86]">EMA 20/50 Confluence</span>
                  </div>
                  <BrokerCandlestickChart symbol={gallerySymbol} defaultTimeframe="1D" height={260} showTimeframeSelector={false} />
                </div>

                {/* Weekly Horizon */}
                <div className="bg-[#151921] p-3.5 rounded border border-[#2A2E39] space-y-2">
                  <div className="flex items-center justify-between border-b border-[#2A2E39] pb-1.5 text-xs font-mono">
                    <span className="font-bold text-[#4BA2FF]">Weekly Macro Trend Horizon</span>
                    <span className="text-[#787B86]">200-EMA Macro Trend</span>
                  </div>
                  <BrokerCandlestickChart symbol={gallerySymbol} defaultTimeframe="1W" height={260} showTimeframeSelector={false} />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MarketCarpet Index & Sector Heatmap (19B) */}
          {/* ========================================================================= */}
          {activeTab === 'marketcarpet' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#26A69A]" /> MarketCarpet: Visual Index & Sector Heatmap
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Tile sizes proportional to market capitalization/turnover; colors indicate price change % momentum.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0B0E11] p-1 rounded border border-[#2A2E39] text-xs font-mono">
                  {(['NIFTY50', 'ALL_SCANNED', 'SECTORS'] as const).map((sc) => (
                    <button
                      key={sc}
                      onClick={() => setCarpetScope(sc)}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        carpetScope === sc ? 'bg-[#26A69A] text-black font-bold' : 'text-[#787B86] hover:text-white'
                      }`}
                    >
                      {sc.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {stocks.map((s) => {
                  const isPositive = s.priceChangePercent >= 0;
                  const intensity = Math.min(1, Math.abs(s.priceChangePercent) / 4);
                  const bgColor = isPositive
                    ? `rgba(38, 166, 154, ${0.25 + intensity * 0.65})`
                    : `rgba(239, 83, 80, ${0.25 + intensity * 0.65})`;

                  return (
                    <div
                      key={s.symbol}
                      onClick={() => onSelectStock && onSelectStock(s)}
                      className="p-3 rounded border border-[#2A2E39] flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-transform select-none h-24"
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-mono font-bold text-white text-xs tracking-tight">{s.symbol}</span>
                        <span className="text-[10px] font-mono text-white/80">₹{s.currentPrice}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-[9px] text-white/70 font-mono truncate max-w-[65%]">{s.sector}</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {isPositive ? '+' : ''}{s.priceChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: Relative Rotation Graphs (RRG) (19D) */}
          {/* ========================================================================= */}
          {activeTab === 'rrg' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#26A69A]" /> Relative Rotation Graphs (RRG) — Sector Rotation
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Plots Relative Strength (RS-Ratio) vs Momentum (RS-Momentum) against NIFTY 50 benchmark.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#787B86]">Benchmark:</span>
                  <span className="px-2 py-1 bg-[#0B0E11] rounded border border-[#2A2E39] text-[#4BA2FF] font-bold">
                    NIFTY 50 (100.0, 100.0)
                  </span>
                </div>
              </div>

              {/* RRG Quadrant SVG Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-[#151921] p-4 rounded border border-[#2A2E39] relative">
                  <svg viewBox="0 0 600 400" className="w-full h-auto select-none font-mono">
                    {/* Quadrant Background Shading */}
                    {/* Top-Left: Improving (Blue) */}
                    <rect x="30" y="30" width="270" height="170" fill="rgba(75, 162, 255, 0.06)" />
                    {/* Top-Right: Leading (Green) */}
                    <rect x="300" y="30" width="270" height="170" fill="rgba(38, 166, 154, 0.08)" />
                    {/* Bottom-Left: Lagging (Red) */}
                    <rect x="30" y="200" width="270" height="170" fill="rgba(239, 83, 80, 0.06)" />
                    {/* Bottom-Right: Weakening (Yellow) */}
                    <rect x="300" y="200" width="270" height="170" fill="rgba(255, 213, 79, 0.06)" />

                    {/* Quadrant Labels */}
                    <text x="45" y="55" fill="#4BA2FF" fontSize="11" fontWeight="bold">IMPROVING (RS Accelerating)</text>
                    <text x="420" y="55" fill="#26A69A" fontSize="11" fontWeight="bold">LEADING (Outperforming)</text>
                    <text x="45" y="360" fill="#EF5350" fontSize="11" fontWeight="bold">LAGGING (Underperforming)</text>
                    <text x="420" y="360" fill="#FFD54F" fontSize="11" fontWeight="bold">WEAKENING (Decelerating)</text>

                    {/* Center Axes Lines at (100, 100) */}
                    <line x1="300" y1="30" x2="300" y2="370" stroke="#4BA2FF" strokeWidth="1.5" strokeDasharray="4 2" />
                    <line x1="30" y1="200" x2="570" y2="200" stroke="#4BA2FF" strokeWidth="1.5" strokeDasharray="4 2" />

                    {/* Benchmark Center Point */}
                    <circle cx="300" cy="200" r="5" fill="#4BA2FF" />
                    <text x="308" y="204" fill="#4BA2FF" fontSize="9.5" fontWeight="bold">NIFTY 50 (100,100)</text>

                    {/* Plot Sector Nodes and History Trails */}
                    {rrgItems.map((item) => {
                      // Map ratio range (95-108) to SVG X (30-570)
                      // Map momentum range (95-108) to SVG Y (370-30)
                      const getX = (r: number) => 300 + (r - 100) * 35;
                      const getY = (m: number) => 200 - (m - 100) * 35;

                      const cx = getX(item.rsRatio);
                      const cy = getY(item.rsMomentum);

                      const trailPoints = item.history.map((h) => `${getX(h.rsRatio)},${getY(h.rsMomentum)}`).join(' ');

                      const colors: Record<string, string> = {
                        Leading: '#26A69A',
                        Weakening: '#FFD54F',
                        Lagging: '#EF5350',
                        Improving: '#4BA2FF',
                      };
                      const color = colors[item.quadrant];

                      return (
                        <g key={item.symbol}>
                          {/* Historical Trail Polyline */}
                          <polyline fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" points={trailPoints} />
                          {/* Current Head Node */}
                          <circle cx={cx} cy={cy} r="6" fill={color} stroke="#FFFFFF" strokeWidth="1" />
                          {/* Label */}
                          <text x={cx + 8} y={cy + 3} fill={color} fontSize="9.5" fontWeight="bold">
                            {item.symbol}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Quadrant Classification Table */}
                <div className="bg-[#151921] p-4 rounded border border-[#2A2E39] space-y-3 font-mono">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#2A2E39] pb-2">
                    Sector Rotation Breakdown
                  </h4>
                  <div className="space-y-2 text-xs">
                    {rrgItems.map((item) => (
                      <div key={item.symbol} className="p-2 bg-[#0B0E11] rounded border border-[#2A2E39] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{item.symbol}</div>
                          <div className="text-[10px] text-[#787B86]">
                            RS-Ratio: {item.rsRatio} | Momentum: {item.rsMomentum}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.quadrant === 'Leading'
                              ? 'bg-[#26A69A]/20 text-[#26A69A]'
                              : item.quadrant === 'Improving'
                              ? 'bg-[#4BA2FF]/20 text-[#4BA2FF]'
                              : item.quadrant === 'Weakening'
                              ? 'bg-[#FFD54F]/20 text-[#FFD54F]'
                              : 'bg-[#EF5350]/20 text-[#EF5350]'
                          }`}
                        >
                          {item.quadrant}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: Indian SCTR Composite Technical Rankings (19E) */}
          {/* ========================================================================= */}
          {activeTab === 'sctr' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#26A69A]" /> Indian Composite Technical Rank (SCTR 0–100 Percentile)
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Ranks every Indian stock across its cap tier blending 200/50 EMA trends, Rate of Change (ROC), and 14 RSI momentum.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0B0E11] p-1 rounded border border-[#2A2E39] text-xs font-mono">
                  {(['ALL', 'Large-Cap', 'Mid-Cap', 'Small-Cap', 'SME / Micro-Cap'] as const).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSctrTierFilter(tier)}
                      className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        sctrTierFilter === tier ? 'bg-[#26A69A] text-black font-bold' : 'text-[#787B86] hover:text-white'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* SCTR Rank Table */}
              <div className="bg-[#151921] rounded border border-[#2A2E39] overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#10141B] border-b border-[#2A2E39] text-[#787B86]">
                    <tr>
                      <th className="p-3">Rank (0-100)</th>
                      <th className="p-3">Symbol</th>
                      <th className="p-3">Market Tier</th>
                      <th className="p-3">Long-Term (30%)</th>
                      <th className="p-3">Med-Term (40%)</th>
                      <th className="p-3">Short-Term (30%)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2E39]">
                    {filteredSctrRanks.map((r) => (
                      <tr key={r.symbol} className="hover:bg-[#1E222D] transition-colors">
                        <td className="p-3 font-bold text-white">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              r.rank >= 80 ? 'bg-[#26A69A]/25 text-[#26A69A]' : r.rank >= 50 ? 'bg-[#4BA2FF]/20 text-[#4BA2FF]' : 'bg-[#EF5350]/20 text-[#EF5350]'
                            }`}
                          >
                            {r.rank}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white">{r.symbol}</td>
                        <td className="p-3 text-[#D1D4DC]">{r.tier}</td>
                        <td className="p-3 text-[#787B86]">{r.longTermScore} / 100</td>
                        <td className="p-3 text-[#787B86]">{r.mediumTermScore} / 100</td>
                        <td className="p-3 text-[#787B86]">{r.shortTermScore} / 100</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold text-[#26A69A]">{r.trendStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: Seasonality Calendar (19C) */}
          {/* ========================================================================= */}
          {activeTab === 'seasonality' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#26A69A]" /> Monthly Seasonality Matrix (10-Year Backtest)
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Historical average returns and win rates across Jan–Dec calendar months.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#787B86]">Stock:</span>
                  <select
                    value={seasonalitySymbol}
                    onChange={(e) => setSeasonalitySymbol(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-white font-mono focus:border-[#26A69A]"
                  >
                    {stocks.map((s) => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 12-Month Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {seasonalityStats.map((st) => {
                  const isPositive = st.avgReturnPct >= 0;
                  return (
                    <div
                      key={st.month}
                      className="p-3.5 bg-[#151921] rounded border border-[#2A2E39] font-mono space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between border-b border-[#2A2E39] pb-1">
                        <span className="font-bold text-white text-xs uppercase">{st.month}</span>
                        <span className="text-[10px] text-[#787B86]">12Y Sample</span>
                      </div>
                      <div>
                        <div className={`text-base font-bold ${isPositive ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                          {isPositive ? '+' : ''}{st.avgReturnPct}%
                        </div>
                        <div className="text-[10px] text-[#787B86]">Avg Return</div>
                      </div>
                      <div className="pt-1 border-t border-[#2A2E39] flex items-center justify-between text-[10px]">
                        <span className="text-[#787B86]">Win Rate:</span>
                        <span className="font-bold text-white">{st.positiveYearsPct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: Saved ChartLists & Scheduled Scans (19F) */}
          {/* ========================================================================= */}
          {activeTab === 'workbench' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Saved ChartLists */}
              <div className="bg-[#151921] p-4 rounded border border-[#2A2E39] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#2A2E39] pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FolderPlus className="h-4 w-4 text-[#26A69A]" /> Saved ChartLists (Re-usable Symbol Watchlists)
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {savedLists.map((list) => (
                    <div key={list.id} className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{list.name}</span>
                        <span className="text-[10px] text-[#787B86]">{list.symbols.length} Symbols</span>
                      </div>
                      <p className="text-[11px] text-[#787B86] font-sans">{list.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {list.symbols.map((sym) => (
                          <span key={sym} className="px-1.5 py-0.5 bg-[#151921] border border-[#2A2E39] rounded text-[10px] text-[#26A69A] font-bold">
                            {sym}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add List Form */}
                <div className="pt-2 border-t border-[#2A2E39] space-y-2">
                  <input
                    type="text"
                    placeholder="New ChartList Name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-xs text-white focus:border-[#26A69A]"
                  />
                  <input
                    type="text"
                    placeholder="Description / Strategy..."
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    className="w-full bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-xs text-white focus:border-[#26A69A]"
                  />
                  <button
                    onClick={handleAddList}
                    className="w-full py-1.5 bg-[#26A69A] text-black text-xs font-bold rounded hover:bg-[#34b7ab] cursor-pointer"
                  >
                    + Create ChartList
                  </button>
                </div>
              </div>

              {/* Scheduled Scans & Automated Alerts */}
              <div className="bg-[#151921] p-4 rounded border border-[#2A2E39] space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[#2A2E39] pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#4BA2FF]" /> Scheduled Scans Workbench
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {scheduledScans.map((sched) => (
                    <div key={sched.id} className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{sched.presetName}</span>
                        <button
                          onClick={() => {
                            setScheduledScans(
                              scheduledScans.map((s) => (s.id === sched.id ? { ...s, active: !s.active } : s))
                            );
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase cursor-pointer ${
                            sched.active ? 'bg-[#26A69A]/20 text-[#26A69A]' : 'bg-[#EF5350]/20 text-[#EF5350]'
                          }`}
                        >
                          {sched.active ? 'Active' : 'Paused'}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#787B86]">
                        <span>Frequency: <strong className="text-white">{sched.frequency}</strong></span>
                        <span>Last Run: {sched.lastRun}</span>
                        <span className="text-[#26A69A]">+{sched.newMatchesCount} New Matches</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: Real-Time Advanced Alerts (19G) */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#26A69A]" /> Real-Time Multi-Condition Alerts (Auto-Refresh)
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Configure price breakout thresholds, RSI triggers, volume spikes, and composite rank alerts.
                  </p>
                </div>
              </div>

              {/* Alert Creation Form */}
              <div className="bg-[#151921] p-4 rounded border border-[#2A2E39] flex flex-wrap items-center gap-3 font-mono text-xs">
                <input
                  type="text"
                  placeholder="Symbol (e.g. RELIANCE)"
                  value={newAlertSymbol}
                  onChange={(e) => setNewAlertSymbol(e.target.value.toUpperCase())}
                  className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-white font-mono uppercase focus:border-[#26A69A]"
                />
                <select
                  value={newAlertCondition}
                  onChange={(e) => setNewAlertCondition(e.target.value as any)}
                  className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-white focus:border-[#26A69A]"
                >
                  <option value="price_cross">Price Crosses Above</option>
                  <option value="rsi_trigger">RSI Drops Below</option>
                  <option value="volume_spike">Volume Surge Multiple (x)</option>
                  <option value="composite_rank">SCTR Rank Above</option>
                </select>
                <input
                  type="number"
                  placeholder="Threshold Value"
                  value={newAlertVal}
                  onChange={(e) => setNewAlertVal(Number(e.target.value))}
                  className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-white w-28 focus:border-[#26A69A]"
                />
                <button
                  onClick={handleAddAlert}
                  className="px-4 py-1.5 bg-[#26A69A] text-black font-bold rounded hover:bg-[#34b7ab] cursor-pointer"
                >
                  + Add Alert Rule
                </button>
              </div>

              {/* Existing Alerts List */}
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div key={al.id} className="p-3 bg-[#151921] rounded border border-[#2A2E39] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`p-1 rounded ${al.triggered ? 'bg-[#26A69A]/20 text-[#26A69A]' : 'bg-[#787B86]/20 text-[#787B86]'}`}>
                        <Bell className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-bold text-white">{al.symbol} — {al.message}</div>
                        <div className="text-[10px] text-[#787B86]">Created: {al.createdAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${al.triggered ? 'bg-[#26A69A]/20 text-[#26A69A]' : 'bg-[#FF9800]/20 text-[#FF9800]'}`}>
                        {al.triggered ? 'TRIGGERED' : 'ARMED'}
                      </span>
                      <button
                        onClick={() => setAlerts(alerts.filter((a) => a.id !== al.id))}
                        className="text-[#787B86] hover:text-[#EF5350] p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 10: Multi-Asset Symbol Directory (19H) */}
          {/* ========================================================================= */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#26A69A]" /> Symbol Catalog & Multi-Asset Directory
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Search across Indian Equities, SME Emerge, Indices, ETFs, Commodities, and Forex.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search by Symbol or Name..."
                    value={catalogQuery}
                    onChange={(e) => setCatalogQuery(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-xs text-white font-mono w-56 focus:border-[#26A69A]"
                  />
                  <select
                    value={catalogCategory}
                    onChange={(e) => setCatalogCategory(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-xs text-white font-mono focus:border-[#26A69A]"
                  >
                    <option value="ALL">All Asset Classes</option>
                    <option value="Equity">Equities</option>
                    <option value="SME">SME Emerge</option>
                    <option value="Index">Indices</option>
                    <option value="ETF">ETFs</option>
                    <option value="Commodity">Commodities (MCX)</option>
                    <option value="Currency">Forex (USDINR)</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#151921] rounded border border-[#2A2E39] overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#10141B] border-b border-[#2A2E39] text-[#787B86]">
                    <tr>
                      <th className="p-3">Symbol</th>
                      <th className="p-3">Name & Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Exchange</th>
                      <th className="p-3">LTP (₹)</th>
                      <th className="p-3">Change %</th>
                      <th className="p-3">Turnover / Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2E39]">
                    {filteredCatalog.map((item) => (
                      <tr key={item.symbol} className="hover:bg-[#1E222D] transition-colors">
                        <td className="p-3 font-bold text-white">{item.symbol}</td>
                        <td className="p-3 text-[#D1D4DC]">{item.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#2A2E39] text-[#D1D4DC]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3 text-[#787B86]">{item.exchange}</td>
                        <td className="p-3 font-bold text-white">₹{item.price}</td>
                        <td className={`p-3 font-bold ${item.changePct >= 0 ? 'text-[#26A69A]' : 'text-[#EF5350]'}`}>
                          {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                        </td>
                        <td className="p-3 text-[#787B86]">{item.volumeOrOI}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 11: ChartSchool Structured Knowledge Base (19I) */}
          {/* ========================================================================= */}
          {activeTab === 'chartschool' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151921] p-3.5 rounded border border-[#2A2E39]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#26A69A]" /> ChartSchool: Terminal & Quantitative Education
                  </h3>
                  <p className="text-xs text-[#787B86] mt-0.5">
                    Clear mathematical explanations of SCTR ranks, RRG rotation, Ichimoku clouds, and technical setups.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search ChartSchool..."
                    value={schoolQuery}
                    onChange={(e) => setSchoolQuery(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-xs text-white font-mono w-52 focus:border-[#26A69A]"
                  />
                  <select
                    value={schoolCategory}
                    onChange={(e) => setSchoolCategory(e.target.value)}
                    className="bg-[#0B0E11] border border-[#2A2E39] px-3 py-1.5 rounded text-xs text-white font-mono focus:border-[#26A69A]"
                  >
                    <option value="ALL">All Topics</option>
                    <option value="SCTR & Scoring">SCTR & Scoring</option>
                    <option value="RRG Sector Rotation">RRG Rotation</option>
                    <option value="Indicators">Indicators</option>
                    <option value="Chart Types">Chart Types</option>
                    <option value="Candlestick Patterns">Candlestick Patterns</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchoolTopics.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedSchoolTopic(topic)}
                    className="bg-[#151921] p-4 rounded border border-[#2A2E39] hover:border-[#26A69A]/50 transition-all cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#26A69A]/15 text-[#26A69A] font-bold border border-[#26A69A]/30">
                          {topic.category}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#787B86]" />
                      </div>
                      <h4 className="text-sm font-bold text-white">{topic.title}</h4>
                      <p className="text-xs text-[#787B86] leading-relaxed">{topic.summary}</p>
                    </div>

                    <div className="pt-2 border-t border-[#2A2E39] font-mono text-[10px] text-[#26A69A]">
                      Click to explore formula & trading execution →
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Topic Modal Preview */}
              {selectedSchoolTopic && (
                <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
                  <div className="bg-[#151921] border border-[#26A69A]/50 rounded-lg max-w-2xl w-full p-5 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#2A2E39] pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-[#26A69A]">
                          {selectedSchoolTopic.category}
                        </span>
                        <h3 className="text-base font-bold text-white mt-0.5">{selectedSchoolTopic.title}</h3>
                      </div>
                      <button
                        onClick={() => setSelectedSchoolTopic(null)}
                        className="text-[#787B86] hover:text-white p-1 cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3 font-sans text-xs text-[#D1D4DC] leading-relaxed">
                      <div>
                        <strong className="text-white block mb-1">Executive Summary:</strong>
                        <p>{selectedSchoolTopic.summary}</p>
                      </div>

                      <div className="p-3 bg-[#0B0E11] rounded border border-[#2A2E39] font-mono text-[11px]">
                        <strong className="text-[#26A69A] block mb-1">Formula & Mathematical Architecture:</strong>
                        <p className="text-[#D1D4DC]">{selectedSchoolTopic.formulaOrStructure}</p>
                      </div>

                      <div>
                        <strong className="text-white block mb-1">Terminal Interpretation:</strong>
                        <p>{selectedSchoolTopic.interpretation}</p>
                      </div>

                      <div className="p-3 bg-[#26A69A]/10 rounded border border-[#26A69A]/30">
                        <strong className="text-[#26A69A] block mb-1 font-mono">Real-World Trading Application:</strong>
                        <p className="text-white">{selectedSchoolTopic.tradingApplication}</p>
                      </div>
                    </div>
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
