export interface OHLCVCandle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  prevRsi14: number;
  ema20: number;
  ema50: number;
  ema200: number;
  volSma20: number;
  volumeRatio: number;
  aboveEma20: boolean;
  aboveEma50: boolean;
  aboveEma200: boolean;
  emaGoldenAlignment: boolean;
  emaGoldenCross: boolean;
}

export type CandlestickPatternType =
  | 'Hammer Reversal'
  | 'Bullish Engulfing'
  | 'EMA Golden Alignment'
  | 'Volume Breakout'
  | 'RSI Momentum Reversal'
  | 'Shooting Star'
  | 'Bearish Engulfing'
  | 'Consolidation'
  | 'Morning Star'
  | 'Piercing Line'
  | 'Three White Soldiers'
  | 'Ascending Triangle'
  | 'Cup & Handle';

export type TradingStyleProfile = 'intraday' | 'swing' | 'positional' | 'long_term';

export interface AnalysisSegmentToggles {
  candlestick: boolean;
  volume: boolean;
  technical: boolean;
  historical: boolean;
  fundamentals: boolean;
  news: boolean;
  sector_context: boolean;
}

export interface SegmentScoreDetail {
  candlestick?: {
    score: number;
    pattern: string;
    timeframe: string;
    confidence: 'high' | 'medium' | 'low' | string;
    evidence?: string;
  };
  volume?: {
    score: number;
    relative_volume: string;
    flag: 'genuine' | 'unconfirmed';
    evidence?: string;
  };
  technical?: {
    score: number;
    indicators: {
      rsi?: number | string;
      macd?: string;
      ema_alignment?: string;
      adx?: number | string;
      [key: string]: any;
    };
    evidence?: string;
  };
  historical?: {
    score: number;
    sample_size: number;
    notes: string;
  };
  fundamentals?: {
    score: number;
    metrics: {
      pe?: number | string;
      pb?: number | string;
      debt_to_equity?: number | string;
      roe?: string;
      profit_growth_yoy?: string;
      [key: string]: any;
    };
  };
  news?: {
    score: number;
    headline: string;
    source: string;
    timestamp: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    is_priced_in?: boolean;
  };
  sector_context?: {
    score: number;
    relative_strength: string;
    sector_trend?: string;
  };
}

export interface StockSuggestionItem {
  symbol: string;
  trading_style: TradingStyleProfile;
  suggestion_score: number;
  action: 'buy' | 'watch' | 'avoid';
  segments: SegmentScoreDetail;
  entry_zone: string;
  stop_loss: string;
  targets: string[];
  data_timestamp: string;
  data_freshness: 'live' | 'delayed' | 'stale';
  primary_reason?: string;
  risk_reward?: string;
  invalidation_note?: string;
}

export interface ScannedStock {
  symbol: string; // e.g. "RELIANCE"
  ticker: string; // e.g. "NSE:RELIANCE" or "RELIANCE.NS"
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  high52Week: number;
  low52Week: number;
  volume: number;
  avgVolume20: number;
  volumeSpikeRatio: number;
  rsi14: number;
  prevRsi14: number;
  ema20: number;
  ema50: number;
  ema200: number;
  aboveEma20: boolean;
  aboveEma50: boolean;
  aboveEma200: boolean;
  patterns: CandlestickPatternType[];
  score: number;
  scoringReasons: string[];
  history?: OHLCVCandle[];
  isin?: string;
  series?: 'EQ' | 'BE' | 'BZ' | 'SM' | 'ST';
  dualListing?: { bseCode?: string; nseSymbol?: string; bsePrice?: number };
  dataQualityFlag?: 'Active (EQ)' | 'Trade-to-Trade (BE)' | 'Z-Group (BZ)' | 'SME Emerge (SM)' | 'BSE SME (ST)' | 'Thinly Traded' | 'Upper Circuit' | 'Lower Circuit';
  dataFreshness?: 'live' | 'delayed' | 'stale';
  tier?: 1 | 2 | 3;
}

export interface UniverseTelemetry {
  totalDedupedIsin: number;
  nseCount: number;
  bseCount: number;
  smeCount: number;
  pennySub10Count: number;
  scannedCount: number;
  filtersAppliedCount: number;
  matchedCount: number;
  lastRefreshed: string;
  dataFeedStatus: string;
}

export interface ChartMarker {
  time: string;
  type: 'pattern' | 'entry' | 'stop' | 'target';
  label: string;
  price?: number;
  confidence?: string;
  description?: string;
}

export interface ChartOverlays {
  ema_9?: number[];
  ema_21?: number[];
  ema_50?: number[];
  ema_200?: number[];
  bollinger_bands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

export interface ChartDataPayload {
  timeframe: '1m' | '5m' | '15m' | '1H' | '1D' | '1W' | '1M';
  candles: OHLCVCandle[];
  overlays?: ChartOverlays;
  markers?: ChartMarker[];
}

export type MarketCapCategory = 'all' | 'penny' | 'micro' | 'small' | 'mid' | 'large';

export type BreakoutFilterStatus = 'all' | 'confirmed' | 'unconfirmed';

export type TrendDirection = 'all' | 'uptrend' | 'downtrend' | 'sideways';

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  isCustom?: boolean;
  filters: Partial<ScanFilterOptions>;
}

export interface ScanFilterOptions {
  index: 'NIFTY50' | 'NIFTY_BANK' | 'NIFTY_IT' | 'NIFTY_AUTO' | 'NIFTY_MIDCAP' | 'NIFTY_SMALLCAP' | 'NIFTY500_TOP' | 'ALL_NSE_BSE' | 'CUSTOM';
  exchange: 'ALL' | 'NSE' | 'BSE';
  customTickers?: string[];
  filterLogic: 'AND' | 'OR';
  // Price & Market Cap
  minPrice: number;
  maxPrice: number;
  marketCap: MarketCapCategory;
  near52wHighPct?: number; // e.g. within 10% of 52W High
  // Volume & Liquidity
  volumeRatioMin: number;
  minAvgVolume: number;
  unusualVolumeOnly: boolean;
  // Volatility & Risk
  minScore: number;
  maxAtrPct?: number;
  // Technical
  rsiMin: number;
  rsiMax: number;
  mustBeAboveEma20: boolean;
  mustBeAboveEma50: boolean;
  mustBeAboveEma200: boolean;
  patternsRequired?: string[];
  breakoutStatus: BreakoutFilterStatus;
  trendDirection: TrendDirection;
  // Fundamental
  maxPe?: number;
  maxDebtToEquity?: number;
  profitableOnly: boolean;
  // Series & Universe Segment Filter
  seriesFilter?: 'ALL' | 'EQ' | 'BE' | 'BZ' | 'SM' | 'ST';
  includeSME?: boolean;
  includeTradeToTrade?: boolean;
  includeZGroup?: boolean;
  // News & Events
  hasVerifiedNewsOnly: boolean;
  // Price Change
  minDayChangePct?: number;
  maxDayChangePct?: number;
}

export interface AITradeOpportunity {
  rank: number;
  symbol: string;
  ticker: string;
  companyName: string;
  sector: string;
  currentPrice: number;
  conviction: 'High' | 'Medium' | 'Speculative';
  timeframe: 'Intraday' | 'Swing (1-3 weeks)' | 'Positional (1-3 months)' | 'Long-term Investment';
  setupType: string;
  entryZone: string;
  suggestedEntry: number;
  target1: number;
  target2: number;
  target1Percent: number;
  target2Percent: number;
  stopLoss: number;
  stopLossPercent: number;
  riskRewardRatio: string;
  catalystRationale: string;
  technicalFactors: string[];
  risksAndWatchouts: string;
  segments?: SegmentScoreDetail;
  dataFreshness?: 'live' | 'delayed' | 'stale';
  dataTimestamp?: string;
  chart_data?: ChartDataPayload;
}

export interface AIAnalysisResponse {
  marketOverview: string;
  niftySentiment: 'Bullish' | 'Neutral' | 'Bearish' | 'Selective Breakout';
  tradingStyle?: TradingStyleProfile;
  enabledSegments?: string[];
  opportunities: AITradeOpportunity[];
  topPicksSummary: string;
  generalRiskNote: string;
  timestamp: string;
  dataFreshness?: 'live' | 'delayed' | 'stale';
  filtersApplied?: Record<string, any>;
  invalidatedSetups?: string[];
  scanCoverage?: {
    universeScanned: number;
    filtersPassed: number;
    displayCount: number;
  };
}

export interface StockDeepDiveAnalysis {
  symbol: string;
  category?: string;
  verdict: 'Strong Buy' | 'Accumulate' | 'Hold/Watch' | 'Avoid';
  overallScore: number;
  trendStructure: string;
  asciiCandleDiagram?: string;
  keySupportLevels: number[];
  keyResistanceLevels: number[];
  candlestickInterpretation: string;
  volumeAnalysis: string;
  riskRewardAssessment: string;
  suggestedActionPlan: string;
  executionTicket?: {
    orderType: string;
    entryRange: string;
    target1: number;
    target2: number;
    stopLoss: number;
    riskRewardRatio: string;
  };
  segmentEvidence?: SegmentScoreDetail;
}

// ----------------------------------------------------
// Section 19: StockCharts.com Feature Parity Types
// ----------------------------------------------------

export type ChartType =
  | 'candlestick'
  | 'heikin_ashi'
  | 'ohlc_bar'
  | 'line'
  | 'area'
  | 'renko'
  | 'kagi'
  | 'point_figure'
  | 'three_line_break';

export interface IndianCompositeTechnicalRank {
  symbol: string;
  rank: number; // 0-100 percentile
  tier: 'Large-Cap' | 'Mid-Cap' | 'Small-Cap' | 'SME / Micro-Cap';
  longTermScore: number; // 200 EMA + 125d ROC
  mediumTermScore: number; // 50 EMA + 20d ROC
  shortTermScore: number; // 14 RSI + 3d slope
  percentileInTier: number;
  trendStatus: 'Super Strong' | 'Strong' | 'Neutral' | 'Deteriorating' | 'Laggard';
}

export interface RRGQuadrantItem {
  symbol: string;
  name: string;
  rsRatio: number; // x-axis (>100 leading/improving, <100 lagging/weakening)
  rsMomentum: number; // y-axis (>100 leading/weakening, <100 lagging/improving)
  quadrant: 'Leading' | 'Weakening' | 'Lagging' | 'Improving';
  history: { rsRatio: number; rsMomentum: number; date?: string }[];
  changePct: number;
  benchmark: string;
}

export interface SeasonalityMonthlyStat {
  month: string;
  avgReturnPct: number;
  positiveYearsPct: number;
  sampleYearsCount: number;
  maxReturnPct: number;
  minReturnPct: number;
}

export interface SavedChartList {
  id: string;
  name: string;
  description: string;
  symbols: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledScan {
  id: string;
  presetName: string;
  frequency: '15m' | '1h' | 'Daily (09:30 IST)' | 'Daily (15:15 IST)';
  active: boolean;
  lastRun?: string;
  newMatchesCount?: number;
  alertEmailOrNotification: boolean;
}

export interface AdvancedAlertRule {
  id: string;
  symbol: string;
  conditionType: 'price_cross' | 'rsi_trigger' | 'volume_spike' | 'composite_rank' | 'multi_condition';
  targetPrice?: number;
  rsiThreshold?: number;
  rsiDirection?: 'above' | 'below';
  volumeRatioThreshold?: number;
  compositeRankThreshold?: number;
  triggered: boolean;
  createdAt: string;
  message: string;
}

export interface MultiAssetItem {
  symbol: string;
  name: string;
  category: 'Equity (NSE/BSE)' | 'SME Emerge' | 'Index' | 'ETF' | 'Commodity' | 'Currency (Forex)';
  price: number;
  changePct: number;
  volumeOrOI: string;
  underlying?: string;
  exchange: 'NSE' | 'BSE' | 'MCX' | 'RBI';
  sctrRank?: number;
}

export interface ChartSchoolTopic {
  id: string;
  title: string;
  category: 'Indicators' | 'Candlestick Patterns' | 'SCTR & Scoring' | 'RRG Sector Rotation' | 'Chart Types' | 'Trading Setups';
  summary: string;
  formulaOrStructure: string;
  interpretation: string;
  tradingApplication: string;
  exampleIllustration?: string;
}

