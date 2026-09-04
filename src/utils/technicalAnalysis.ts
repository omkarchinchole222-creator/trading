import { OHLCVCandle, TechnicalIndicators, CandlestickPatternType } from '../types';

/**
 * Computes Exponential Moving Average array
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = [];

  // Seed with simple moving average of first `period` items if available
  const seedLength = Math.min(period, prices.length);
  let sum = 0;
  for (let i = 0; i < seedLength; i++) {
    sum += prices[i];
  }
  let currentEma = sum / seedLength;
  emaArray.push(currentEma);

  for (let i = 1; i < prices.length; i++) {
    currentEma = prices[i] * k + currentEma * (1 - k);
    emaArray.push(currentEma);
  }

  return emaArray;
}

/**
 * Computes Wilder's Relative Strength Index (RSI 14)
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length < period + 1) {
    return closes.map(() => 50);
  }

  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // Initial average gain & loss
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value
  for (let i = 0; i < period; i++) {
    rsi.push(50); // placeholder for warm-up
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  // Smoothed Wilder's calculation for subsequent values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const currentRsi = 100 - (100 / (1 + rs));
    rsi.push(Math.min(100, Math.max(0, currentRsi)));
  }

  return rsi;
}

/**
 * Computes rolling simple moving average of volume
 */
export function calculateSMA(values: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - period + 1);
    const subset = values.slice(start, i + 1);
    const sum = subset.reduce((acc, v) => acc + v, 0);
    sma.push(sum / subset.length);
  }
  return sma;
}

/**
 * Detects candlestick patterns and technical state for given OHLCV candles
 */
export function analyzeCandlesticksAndIndicators(candles: OHLCVCandle[]): {
  indicators: TechnicalIndicators;
  patterns: CandlestickPatternType[];
  score: number;
  scoringReasons: string[];
} {
  if (candles.length < 2) {
    return {
      indicators: {
        rsi14: 50,
        prevRsi14: 50,
        ema20: 0,
        ema50: 0,
        ema200: 0,
        volSma20: 0,
        volumeRatio: 1.0,
        aboveEma20: false,
        aboveEma50: false,
        aboveEma200: false,
        emaGoldenAlignment: false,
        emaGoldenCross: false,
      },
      patterns: ['Consolidation'],
      score: 50,
      scoringReasons: ['Insufficient historical bars'],
    };
  }

  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);

  const rsiSeries = calculateRSI(closes, 14);
  const ema20Series = calculateEMA(closes, 20);
  const ema50Series = calculateEMA(closes, 50);
  const ema200Series = calculateEMA(closes, 200);
  const volSma20Series = calculateSMA(volumes, 20);

  const latestIndex = candles.length - 1;
  const prevIndex = candles.length - 2;

  const latest = candles[latestIndex];
  const prev = candles[prevIndex];

  const currClose = latest.close;
  const currRsi = Math.round((rsiSeries[latestIndex] || 50) * 100) / 100;
  const prevRsi = Math.round((rsiSeries[prevIndex] || 50) * 100) / 100;

  const currEma20 = ema20Series[latestIndex] || currClose;
  const currEma50 = ema50Series[latestIndex] || currClose;
  const currEma200 = ema200Series[latestIndex] || currClose;

  const prevEma20 = ema20Series[prevIndex] || prev.close;
  const prevEma50 = ema50Series[prevIndex] || prev.close;

  const currVol = latest.volume;
  const avgVol = volSma20Series[latestIndex] || currVol;
  const volRatio = avgVol > 0 ? Math.round((currVol / avgVol) * 100) / 100 : 1.0;

  const aboveEma20 = currClose > currEma20;
  const aboveEma50 = currClose > currEma50;
  const aboveEma200 = currClose > currEma200;
  const emaGoldenAlignment = currClose > currEma20 && currEma20 > currEma50;
  const emaGoldenCross = currEma20 > currEma50 && prevEma20 <= prevEma50;

  // Candlestick Detection
  const body = Math.abs(latest.open - latest.close);
  const range = Math.max(0.001, latest.high - latest.low);
  const lowerShadow = Math.min(latest.open, latest.close) - latest.low;
  const upperShadow = latest.high - Math.max(latest.open, latest.close);

  // Hammer Reversal
  const isHammer = (range > 2.5 * body) &&
                   ((latest.close - latest.low) / range > 0.58) &&
                   (lowerShadow >= 2 * body);

  // Bullish Engulfing
  const isBullishEngulfing = (prev.close < prev.open) &&
                             (latest.close > latest.open) &&
                             (latest.close >= prev.open) &&
                             (latest.open <= prev.close);

  // Shooting star
  const isShootingStar = (range > 2.5 * body) &&
                         (upperShadow >= 2 * body) &&
                         ((latest.high - latest.close) / range > 0.58);

  const patterns: CandlestickPatternType[] = [];
  if (isHammer) patterns.push('Hammer Reversal');
  if (isBullishEngulfing) patterns.push('Bullish Engulfing');
  if (emaGoldenAlignment) patterns.push('EMA Golden Alignment');
  if (volRatio >= 1.5) patterns.push('Volume Breakout');
  if (currRsi >= 40 && currRsi <= 62 && currRsi > prevRsi) patterns.push('RSI Momentum Reversal');
  if (isShootingStar) patterns.push('Shooting Star');

  if (patterns.length === 0) {
    patterns.push('Consolidation');
  }

  // Scoring conditions (0 - 100)
  let score = 50;
  const reasons: string[] = [];

  // RSI momentum in bullish accumulation zone
  if (currRsi >= 40 && currRsi <= 65 && currRsi > prevRsi) {
    score += 15;
    reasons.push('RSI Momentum Reversal (40-65)');
  } else if (currRsi > 65 && currRsi <= 75) {
    score += 8;
    reasons.push('Strong Bullish RSI (65-75)');
  } else if (currRsi < 35) {
    score -= 10;
    reasons.push('Oversold Drag (RSI < 35)');
  }

  // EMA alignment
  if (emaGoldenAlignment) {
    score += 20;
    reasons.push('EMA Golden Trend (Price > EMA20 > EMA50)');
  } else if (aboveEma20) {
    score += 10;
    reasons.push('Above 20 EMA Support');
  }

  // Volume Breakout
  if (volRatio >= 2.0) {
    score += 20;
    reasons.push(`Strong Volume Spike (${volRatio}x 20-DMA)`);
  } else if (volRatio >= 1.5) {
    score += 15;
    reasons.push(`1.5x Volume Breakout (${volRatio}x)`);
  }

  // Candlestick Confirmation
  if (isBullishEngulfing) {
    score += 15;
    reasons.push('Bullish Engulfing Candle Confirmation');
  }
  if (isHammer) {
    score += 12;
    reasons.push('Hammer Reversal at Support');
  }

  // 200 EMA Macro support
  if (aboveEma200) {
    score += 10;
    reasons.push('Trading Above 200 EMA Macro Baseline');
  }

  if (emaGoldenCross) {
    score += 10;
    reasons.push('Fresh EMA 20/50 Golden Crossover');
  }

  // Clamp score 10 - 99
  const finalScore = Math.min(99, Math.max(15, score));

  return {
    indicators: {
      rsi14: currRsi,
      prevRsi14: prevRsi,
      ema20: Math.round(currEma20 * 100) / 100,
      ema50: Math.round(currEma50 * 100) / 100,
      ema200: Math.round(currEma200 * 100) / 100,
      volSma20: Math.round(avgVol),
      volumeRatio: volRatio,
      aboveEma20,
      aboveEma50,
      aboveEma200,
      emaGoldenAlignment,
      emaGoldenCross,
    },
    patterns,
    score: finalScore,
    scoringReasons: reasons.length > 0 ? reasons : ['Normal Market Oscillation'],
  };
}
