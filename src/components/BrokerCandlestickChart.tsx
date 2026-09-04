import React, { useState, useMemo, useRef } from 'react';
import { OHLCVCandle, ChartDataPayload, ChartMarker, ChartType } from '../types';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Target,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Info,
  BarChart2,
  Cloud,
} from 'lucide-react';

interface BrokerCandlestickChartProps {
  symbol: string;
  chartData?: ChartDataPayload;
  candles?: OHLCVCandle[];
  entryPrice?: number;
  stopLossPrice?: number;
  target1Price?: number;
  target2Price?: number;
  patternName?: string;
  defaultTimeframe?: '1m' | '5m' | '15m' | '1H' | '1D' | '1W' | '1M';
  defaultChartType?: ChartType;
  height?: number;
  showTimeframeSelector?: boolean;
  showOverlayToggles?: boolean;
}

export const BrokerCandlestickChart: React.FC<BrokerCandlestickChartProps> = ({
  symbol,
  chartData,
  candles: directCandles,
  entryPrice,
  stopLossPrice,
  target1Price,
  target2Price,
  patternName,
  defaultTimeframe = '1D',
  defaultChartType = 'candlestick',
  height = 360,
  showTimeframeSelector = true,
  showOverlayToggles = true,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(
    chartData?.timeframe || defaultTimeframe
  );
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);

  // Overlay state toggles
  const [showEma9, setShowEma9] = useState<boolean>(true);
  const [showEma21, setShowEma21] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(false);
  const [showEma200, setShowEma200] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showIchimoku, setShowIchimoku] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showTradeLevels, setShowTradeLevels] = useState<boolean>(true);
  const [showPatterns, setShowPatterns] = useState<boolean>(true);

  // Zoom & Hover state
  const [zoomLevel, setZoomLevel] = useState<number>(35); // number of visible candles
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Resolve raw candles
  const rawCandles = useMemo(() => {
    if (chartData?.candles && chartData.candles.length > 0) {
      return chartData.candles;
    }
    if (directCandles && directCandles.length > 0) {
      return directCandles;
    }
    return [];
  }, [chartData, directCandles]);

  // Windowed visible candles based on zoom
  const visibleCandles = useMemo(() => {
    if (rawCandles.length === 0) return [];
    return rawCandles.slice(-Math.min(zoomLevel, rawCandles.length));
  }, [rawCandles, zoomLevel]);

  // Compute Heikin-Ashi candles
  const heikinAshiCandles = useMemo(() => {
    if (visibleCandles.length === 0) return [];
    const ha: OHLCVCandle[] = [];
    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const prevHa = i === 0 ? c : ha[i - 1];
      const haOpen = i === 0 ? (c.open + c.close) / 2 : (prevHa.open + prevHa.close) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);
      ha.push({
        date: c.date,
        open: Math.round(haOpen * 100) / 100,
        high: Math.round(haHigh * 100) / 100,
        low: Math.round(haLow * 100) / 100,
        close: Math.round(haClose * 100) / 100,
        volume: c.volume,
      });
    }
    return ha;
  }, [visibleCandles]);

  // Compute Moving Averages & Bollinger Bands & Ichimoku dynamically
  const { ema9List, ema21List, ema50List, ema200List, bbUpperList, bbLowerList, bbMiddleList, tenkanList, kijunList, spanAList, spanBList } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return {
        ema9List: [],
        ema21List: [],
        ema50List: [],
        ema200List: [],
        bbUpperList: [],
        bbLowerList: [],
        bbMiddleList: [],
        tenkanList: [],
        kijunList: [],
        spanAList: [],
        spanBList: [],
      };
    }

    const closes = visibleCandles.map((c) => c.close);

    function calcEMA(arr: number[], period: number) {
      const k = 2 / (period + 1);
      const res: number[] = [];
      let prev = arr[0];
      for (let i = 0; i < arr.length; i++) {
        if (i < period) {
          const slice = arr.slice(0, i + 1);
          prev = slice.reduce((a, b) => a + b, 0) / slice.length;
        } else {
          prev = arr[i] * k + prev * (1 - k);
        }
        res.push(prev);
      }
      return res;
    }

    const ema9 = calcEMA(closes, 9);
    const ema21 = calcEMA(closes, 21);
    const ema50 = calcEMA(closes, 50);
    const ema200 = calcEMA(closes, 200);

    const bbU: number[] = [];
    const bbM: number[] = [];
    const bbL: number[] = [];
    const period = 20;

    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        const slice = closes.slice(0, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
        bbM.push(mean);
        bbU.push(mean * 1.02);
        bbL.push(mean * 0.98);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const mean = slice.reduce((a, b) => a + b, 0) / period;
        const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        bbM.push(mean);
        bbU.push(mean + 2 * stdDev);
        bbL.push(mean - 2 * stdDev);
      }
    }

    // Ichimoku Calculations
    const tenkan: number[] = [];
    const kijun: number[] = [];
    const spanA: number[] = [];
    const spanB: number[] = [];

    for (let i = 0; i < visibleCandles.length; i++) {
      // Tenkan-sen (9 period midpoint)
      const tSlice = visibleCandles.slice(Math.max(0, i - 8), i + 1);
      const tMax = Math.max(...tSlice.map((c) => c.high));
      const tMin = Math.min(...tSlice.map((c) => c.low));
      const tVal = (tMax + tMin) / 2;
      tenkan.push(tVal);

      // Kijun-sen (26 period midpoint)
      const kSlice = visibleCandles.slice(Math.max(0, i - 25), i + 1);
      const kMax = Math.max(...kSlice.map((c) => c.high));
      const kMin = Math.min(...kSlice.map((c) => c.low));
      const kVal = (kMax + kMin) / 2;
      kijun.push(kVal);

      // Senkou Span A ((Tenkan + Kijun) / 2)
      spanA.push((tVal + kVal) / 2);

      // Senkou Span B (52 period midpoint)
      const bSlice = visibleCandles.slice(Math.max(0, i - 51), i + 1);
      const bMax = Math.max(...bSlice.map((c) => c.high));
      const bMin = Math.min(...bSlice.map((c) => c.low));
      spanB.push((bMax + bMin) / 2);
    }

    return {
      ema9List: ema9,
      ema21List: ema21,
      ema50List: ema50,
      ema200List: ema200,
      bbUpperList: bbU,
      bbLowerList: bbL,
      bbMiddleList: bbM,
      tenkanList: tenkan,
      kijunList: kijun,
      spanAList: spanA,
      spanBList: spanB,
    };
  }, [visibleCandles]);

  // Determine coordinate ranges
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (visibleCandles.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 10000 };

    let min = Math.min(...visibleCandles.map((c) => c.low));
    let max = Math.max(...visibleCandles.map((c) => c.high));
    const maxVol = Math.max(...visibleCandles.map((c) => c.volume), 1);

    // Expand bounds if trade levels exist
    if (showTradeLevels) {
      if (stopLossPrice) min = Math.min(min, stopLossPrice * 0.99);
      if (entryPrice) {
        min = Math.min(min, entryPrice * 0.99);
        max = Math.max(max, entryPrice * 1.01);
      }
      if (target1Price) max = Math.max(max, target1Price * 1.01);
      if (target2Price) max = Math.max(max, target2Price * 1.01);
    }

    const padding = (max - min) * 0.08 || 1;
    return {
      minPrice: Math.max(0.1, min - padding),
      maxPrice: max + padding,
      maxVolume: maxVol,
    };
  }, [visibleCandles, showTradeLevels, entryPrice, stopLossPrice, target1Price, target2Price]);

  // Coordinate transforms
  const svgWidth = 800;
  const pricePlotHeight = showVolume ? height * 0.72 : height - 40;
  const volumePlotHeight = showVolume ? height * 0.2 : 0;
  const margin = { top: 20, right: 65, bottom: 25, left: 10 };
  const plotWidth = svgWidth - margin.left - margin.right;

  const candleCount = visibleCandles.length;
  const candleStep = plotWidth / Math.max(candleCount, 1);
  const candleWidth = Math.max(2, Math.min(18, candleStep * 0.65));

  const getY = (val: number) => {
    if (maxPrice === minPrice) return pricePlotHeight / 2;
    return margin.top + (1 - (val - minPrice) / (maxPrice - minPrice)) * (pricePlotHeight - margin.top);
  };

  const getVolY = (vol: number) => {
    const volBase = height - margin.bottom;
    return volBase - (vol / maxVolume) * volumePlotHeight;
  };

  const activeCandle = hoverIndex !== null && visibleCandles[hoverIndex]
    ? (chartType === 'heikin_ashi' ? heikinAshiCandles[hoverIndex] : visibleCandles[hoverIndex])
    : (chartType === 'heikin_ashi' ? heikinAshiCandles[heikinAshiCandles.length - 1] : visibleCandles[visibleCandles.length - 1]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleCandles.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * svgWidth - margin.left;
    const idx = Math.floor(relativeX / candleStep);
    if (idx >= 0 && idx < visibleCandles.length) {
      setHoverIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const timeframes: Array<'1m' | '5m' | '15m' | '1H' | '1D' | '1W' | '1M'> = [
    '1m',
    '5m',
    '15m',
    '1H',
    '1D',
    '1W',
    '1M',
  ];

  // Overlay line generator
  const createPolylinePoints = (values: number[]) => {
    return values
      .map((val, idx) => {
        const x = margin.left + idx * candleStep + candleStep / 2;
        const y = getY(val);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="bg-[#0B0E11] rounded border border-[#2A2E39] p-3 flex flex-col gap-2.5 font-sans select-none">
      {/* Top Bar: Timeframes, Chart Types, Live Badge, and Overlays */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2A2E39] pb-2 text-xs">
        {/* Timeframe & Chart Type Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {showTimeframeSelector && (
            <div className="flex items-center bg-[#151921] p-0.5 rounded border border-[#2A2E39]">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-[#26A69A] text-white font-bold'
                      : 'text-[#787B86] hover:text-[#D1D4DC]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}

          {/* Chart Type Selector */}
          <div className="flex items-center bg-[#151921] px-2 py-1 rounded border border-[#2A2E39] text-[10px] font-mono">
            <BarChart2 className="h-3 w-3 text-[#26A69A] mr-1.5" />
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer text-[10px]"
            >
              <option value="candlestick" className="bg-[#151921]">Candlestick</option>
              <option value="heikin_ashi" className="bg-[#151921]">Heikin-Ashi</option>
              <option value="ohlc_bar" className="bg-[#151921]">OHLC Bar</option>
              <option value="line" className="bg-[#151921]">Line</option>
              <option value="area" className="bg-[#151921]">Area</option>
              <option value="renko" className="bg-[#151921]">Renko</option>
              <option value="kagi" className="bg-[#151921]">Kagi</option>
              <option value="point_figure" className="bg-[#151921]">Point & Figure</option>
              <option value="three_line_break" className="bg-[#151921]">3-Line Break</option>
            </select>
          </div>
        </div>

        {/* Live Candle Readout */}
        {activeCandle && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono">
            <span className="text-[#787B86]">{activeCandle.date}</span>
            <span className="text-[#D1D4DC]">
              O: <strong className="text-white font-bold">₹{activeCandle.open}</strong>
            </span>
            <span className="text-[#D1D4DC]">
              H: <strong className="text-white font-bold">₹{activeCandle.high}</strong>
            </span>
            <span className="text-[#D1D4DC]">
              L: <strong className="text-white font-bold">₹{activeCandle.low}</strong>
            </span>
            <span className="text-[#D1D4DC]">
              C:{' '}
              <strong
                className={`font-bold ${
                  activeCandle.close >= activeCandle.open ? 'text-[#26A69A]' : 'text-[#EF5350]'
                }`}
              >
                ₹{activeCandle.close}
              </strong>
            </span>
            <span className="text-[#787B86]">
              Vol: <strong className="text-[#D1D4DC]">{(activeCandle.volume / 100000).toFixed(2)}L</strong>
            </span>
          </div>
        )}

        {/* Zoom & Overlay Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setZoomLevel((z) => Math.max(15, z - 8))}
            title="Zoom In"
            className="p-1 rounded text-[#787B86] hover:text-white hover:bg-[#151921] cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(rawCandles.length, z + 8))}
            title="Zoom Out"
            className="p-1 rounded text-[#787B86] hover:text-white hover:bg-[#151921] cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(35)}
            title="Reset Zoom"
            className="p-1 rounded text-[#787B86] hover:text-white hover:bg-[#151921] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Overlay Toggles */}
      {showOverlayToggles && (
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="text-[#787B86] flex items-center gap-1">
            <Layers className="h-3 w-3" /> Overlays:
          </span>

          <button
            onClick={() => setShowEma9((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showEma9
                ? 'bg-[#FFD54F]/15 border-[#FFD54F]/40 text-[#FFD54F]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD54F]" /> EMA 9
          </button>

          <button
            onClick={() => setShowEma21((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showEma21
                ? 'bg-[#4BA2FF]/15 border-[#4BA2FF]/40 text-[#4BA2FF]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#4BA2FF]" /> EMA 21
          </button>

          <button
            onClick={() => setShowEma50((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showEma50
                ? 'bg-[#BA68C8]/15 border-[#BA68C8]/40 text-[#BA68C8]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#BA68C8]" /> EMA 50
          </button>

          <button
            onClick={() => setShowEma200((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showEma200
                ? 'bg-[#FF9800]/15 border-[#FF9800]/40 text-[#FF9800]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF9800]" /> EMA 200
          </button>

          <button
            onClick={() => setShowBollinger((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showBollinger
                ? 'bg-[#00BCD4]/15 border-[#00BCD4]/40 text-[#00BCD4]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#00BCD4]" /> Bollinger
          </button>

          <button
            onClick={() => setShowIchimoku((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showIchimoku
                ? 'bg-[#26A69A]/20 border-[#26A69A]/50 text-[#26A69A]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            <Cloud className="h-3 w-3" /> Ichimoku
          </button>

          <button
            onClick={() => setShowVolume((v) => !v)}
            className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
              showVolume
                ? 'bg-[#26A69A]/15 border-[#26A69A]/40 text-[#26A69A]'
                : 'border-[#2A2E39] text-[#787B86] hover:text-white'
            }`}
          >
            Volume
          </button>

          {(entryPrice || stopLossPrice || target1Price) && (
            <button
              onClick={() => setShowTradeLevels((v) => !v)}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                showTradeLevels
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'border-[#2A2E39] text-[#787B86] hover:text-white'
              }`}
            >
              <Target className="h-2.5 w-2.5" /> Trade Setup Levels
            </button>
          )}
        </div>
      )}

      {/* Main SVG Candlestick Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Horizontal Grid Lines */}
          {[0.15, 0.35, 0.55, 0.75, 0.95].map((pct, i) => {
            const y = margin.top + pct * (pricePlotHeight - margin.top);
            const priceLevel = maxPrice - pct * (maxPrice - minPrice);
            return (
              <g key={`grid-y-${i}`}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={svgWidth - margin.right}
                  y2={y}
                  stroke="#1E222D"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={svgWidth - margin.right + 6}
                  y={y + 3}
                  fill="#787B86"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ₹{priceLevel.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Ichimoku Cloud Shading & Lines */}
          {showIchimoku && spanAList.length > 0 && spanBList.length > 0 && (
            <g>
              {/* Cloud Polygons */}
              {spanAList.map((sa, idx) => {
                if (idx === 0) return null;
                const prevSa = spanAList[idx - 1];
                const sb = spanBList[idx];
                const prevSb = spanBList[idx - 1];
                const x1 = margin.left + (idx - 1) * candleStep + candleStep / 2;
                const x2 = margin.left + idx * candleStep + candleStep / 2;
                const isBullishCloud = sa >= sb;
                const poly = `${x1},${getY(prevSa)} ${x2},${getY(sa)} ${x2},${getY(sb)} ${x1},${getY(prevSb)}`;
                return (
                  <polygon
                    key={`kumo-${idx}`}
                    points={poly}
                    fill={isBullishCloud ? '#26A69A' : '#EF5350'}
                    opacity="0.25"
                  />
                );
              })}
              {/* Tenkan-sen & Kijun-sen */}
              <polyline fill="none" stroke="#4BA2FF" strokeWidth="1.2" points={createPolylinePoints(tenkanList)} />
              <polyline fill="none" stroke="#EF5350" strokeWidth="1.2" points={createPolylinePoints(kijunList)} />
            </g>
          )}

          {/* Bollinger Bands Fill and Lines */}
          {showBollinger && bbUpperList.length > 0 && (
            <g opacity="0.65">
              <polyline
                fill="none"
                stroke="#00BCD4"
                strokeWidth="1"
                strokeDasharray="2 2"
                points={createPolylinePoints(bbUpperList)}
              />
              <polyline
                fill="none"
                stroke="#00BCD4"
                strokeWidth="0.8"
                points={createPolylinePoints(bbMiddleList)}
              />
              <polyline
                fill="none"
                stroke="#00BCD4"
                strokeWidth="1"
                strokeDasharray="2 2"
                points={createPolylinePoints(bbLowerList)}
              />
            </g>
          )}

          {/* EMA Overlays */}
          {showEma9 && ema9List.length > 0 && (
            <polyline
              fill="none"
              stroke="#FFD54F"
              strokeWidth="1.2"
              points={createPolylinePoints(ema9List)}
            />
          )}
          {showEma21 && ema21List.length > 0 && (
            <polyline
              fill="none"
              stroke="#4BA2FF"
              strokeWidth="1.2"
              points={createPolylinePoints(ema21List)}
            />
          )}
          {showEma50 && ema50List.length > 0 && (
            <polyline
              fill="none"
              stroke="#BA68C8"
              strokeWidth="1.2"
              points={createPolylinePoints(ema50List)}
            />
          )}
          {showEma200 && ema200List.length > 0 && (
            <polyline
              fill="none"
              stroke="#FF9800"
              strokeWidth="1.4"
              points={createPolylinePoints(ema200List)}
            />
          )}

          {/* Volume Histogram Panel */}
          {showVolume && (
            <g opacity="0.8">
              <line
                x1={margin.left}
                y1={height - margin.bottom - volumePlotHeight}
                x2={svgWidth - margin.right}
                y2={height - margin.bottom - volumePlotHeight}
                stroke="#2A2E39"
                strokeWidth="1"
              />
              {visibleCandles.map((c, idx) => {
                const x = margin.left + idx * candleStep + (candleStep - candleWidth) / 2;
                const volY = getVolY(c.volume);
                const volH = Math.max(2, height - margin.bottom - volY);
                const isGreen = c.close >= c.open;
                return (
                  <rect
                    key={`vol-${idx}`}
                    x={x}
                    y={volY}
                    width={candleWidth}
                    height={volH}
                    fill={isGreen ? '#26A69A' : '#EF5350'}
                    opacity={idx === hoverIndex ? '1' : '0.45'}
                  />
                );
              })}
            </g>
          )}

          {/* Chart Rendering Modes (Candlestick, Heikin-Ashi, OHLC Bar, Line, Area, Renko, Kagi, Point & Figure, Three Line Break) */}
          {(() => {
            const activeData = chartType === 'heikin_ashi' ? heikinAshiCandles : visibleCandles;

            if (chartType === 'line') {
              const linePoints = activeData
                .map((c, idx) => `${margin.left + idx * candleStep + candleStep / 2},${getY(c.close)}`)
                .join(' ');
              return <polyline fill="none" stroke="#26A69A" strokeWidth="2" points={linePoints} />;
            }

            if (chartType === 'area') {
              const linePoints = activeData
                .map((c, idx) => `${margin.left + idx * candleStep + candleStep / 2},${getY(c.close)}`)
                .join(' ');
              const firstX = margin.left + candleStep / 2;
              const lastX = margin.left + (activeData.length - 1) * candleStep + candleStep / 2;
              const polyPoints = `${firstX},${pricePlotHeight} ${linePoints} ${lastX},${pricePlotHeight}`;
              return (
                <g>
                  <polygon fill="rgba(38, 166, 154, 0.2)" points={polyPoints} />
                  <polyline fill="none" stroke="#26A69A" strokeWidth="2" points={linePoints} />
                </g>
              );
            }

            if (chartType === 'ohlc_bar') {
              return activeData.map((c, idx) => {
                const isGreen = c.close >= c.open;
                const color = isGreen ? '#26A69A' : '#EF5350';
                const xCenter = margin.left + idx * candleStep + candleStep / 2;
                const yHigh = getY(c.high);
                const yLow = getY(c.low);
                const yOpen = getY(c.open);
                const yClose = getY(c.close);

                return (
                  <g key={`bar-${idx}`}>
                    <line x1={xCenter} y1={yHigh} x2={xCenter} y2={yLow} stroke={color} strokeWidth="1.5" />
                    <line x1={xCenter - 4} y1={yOpen} x2={xCenter} y2={yOpen} stroke={color} strokeWidth="1.5" />
                    <line x1={xCenter} y1={yClose} x2={xCenter + 4} y2={yClose} stroke={color} strokeWidth="1.5" />
                  </g>
                );
              });
            }

            if (chartType === 'renko' || chartType === 'kagi' || chartType === 'point_figure' || chartType === 'three_line_break') {
              return activeData.map((c, idx) => {
                const isGreen = c.close >= (idx > 0 ? activeData[idx - 1].close : c.open);
                const color = isGreen ? '#26A69A' : '#EF5350';
                const xBody = margin.left + idx * candleStep + (candleStep - candleWidth) / 2;
                const yClose = getY(c.close);
                const prevClose = idx > 0 ? getY(activeData[idx - 1].close) : yClose;
                const top = Math.min(yClose, prevClose);
                const h = Math.max(4, Math.abs(yClose - prevClose));

                return (
                  <g key={`discrete-${idx}`}>
                    {chartType === 'point_figure' ? (
                      <text
                        x={xBody + candleWidth / 2}
                        y={yClose}
                        fill={color}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {isGreen ? 'X' : 'O'}
                      </text>
                    ) : (
                      <rect
                        x={xBody}
                        y={top}
                        width={candleWidth}
                        height={h}
                        fill={color}
                        stroke={color}
                        strokeWidth="1"
                        rx={chartType === 'three_line_break' ? 1 : 0}
                      />
                    )}
                  </g>
                );
              });
            }

            // Default: Standard Japanese Candlesticks or Heikin-Ashi
            return activeData.map((c, idx) => {
              const isGreen = c.close >= c.open;
              const color = isGreen ? '#26A69A' : '#EF5350';
              const xCenter = margin.left + idx * candleStep + candleStep / 2;
              const xBody = margin.left + idx * candleStep + (candleStep - candleWidth) / 2;

              const yHigh = getY(c.high);
              const yLow = getY(c.low);
              const yOpen = getY(c.open);
              const yClose = getY(c.close);

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={`candle-${idx}`}>
                  {/* Upper and Lower Wick */}
                  <line
                    x1={xCenter}
                    y1={yHigh}
                    x2={xCenter}
                    y2={yLow}
                    stroke={color}
                    strokeWidth={1.2}
                  />
                  {/* Candle Body */}
                  <rect
                    x={xBody}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth={0.5}
                    rx={0.5}
                  />
                </g>
              );
            });
          })()}

          {/* Trade Setup Level Markers (Entry, Stop Loss, Target 1, Target 2) */}
          {showTradeLevels && (
            <g>
              {/* Entry Zone Line */}
              {entryPrice && (
                <g>
                  <line
                    x1={margin.left}
                    y1={getY(entryPrice)}
                    x2={svgWidth - margin.right}
                    y2={getY(entryPrice)}
                    stroke="#26A69A"
                    strokeWidth="1.4"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x={svgWidth - margin.right}
                    y={getY(entryPrice) - 7}
                    width={60}
                    height={14}
                    fill="#26A69A"
                    rx={2}
                  />
                  <text
                    x={svgWidth - margin.right + 4}
                    y={getY(entryPrice) + 3}
                    fill="#000000"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ENTRY ₹{entryPrice}
                  </text>
                </g>
              )}

              {/* Stop Loss Line */}
              {stopLossPrice && (
                <g>
                  <line
                    x1={margin.left}
                    y1={getY(stopLossPrice)}
                    x2={svgWidth - margin.right}
                    y2={getY(stopLossPrice)}
                    stroke="#EF5350"
                    strokeWidth="1.4"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x={svgWidth - margin.right}
                    y={getY(stopLossPrice) - 7}
                    width={60}
                    height={14}
                    fill="#EF5350"
                    rx={2}
                  />
                  <text
                    x={svgWidth - margin.right + 4}
                    y={getY(stopLossPrice) + 3}
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    STOP ₹{stopLossPrice}
                  </text>
                </g>
              )}

              {/* Target 1 Line */}
              {target1Price && (
                <g>
                  <line
                    x1={margin.left}
                    y1={getY(target1Price)}
                    x2={svgWidth - margin.right}
                    y2={getY(target1Price)}
                    stroke="#00BCD4"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={svgWidth - margin.right}
                    y={getY(target1Price) - 7}
                    width={60}
                    height={14}
                    fill="#00BCD4"
                    rx={2}
                  />
                  <text
                    x={svgWidth - margin.right + 4}
                    y={getY(target1Price) + 3}
                    fill="#000000"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    T1 ₹{target1Price}
                  </text>
                </g>
              )}

              {/* Target 2 Line */}
              {target2Price && (
                <g>
                  <line
                    x1={margin.left}
                    y1={getY(target2Price)}
                    x2={svgWidth - margin.right}
                    y2={getY(target2Price)}
                    stroke="#BA68C8"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <rect
                    x={svgWidth - margin.right}
                    y={getY(target2Price) - 7}
                    width={60}
                    height={14}
                    fill="#BA68C8"
                    rx={2}
                  />
                  <text
                    x={svgWidth - margin.right + 4}
                    y={getY(target2Price) + 3}
                    fill="#000000"
                    fontSize="8.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    T2 ₹{target2Price}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Pattern Callout Pin on latest candle */}
          {showPatterns && (patternName || chartData?.markers?.find((m) => m.type === 'pattern')) && (
            <g>
              {(() => {
                const marker = chartData?.markers?.find((m) => m.type === 'pattern');
                const label = marker?.label || patternName || 'Setup Trigger';
                const lastIdx = visibleCandles.length - 1;
                const lastCandle = visibleCandles[lastIdx];
                if (!lastCandle) return null;
                const x = margin.left + lastIdx * candleStep + candleStep / 2;
                const y = getY(lastCandle.high) - 14;
                return (
                  <g>
                    <polygon
                      points={`${x},${y + 10} ${x - 4},${y + 2} ${x + 4},${y + 2}`}
                      fill="#26A69A"
                    />
                    <rect
                      x={Math.max(10, x - 45)}
                      y={y - 8}
                      width={90}
                      height={13}
                      fill="#151921"
                      stroke="#26A69A"
                      strokeWidth="1"
                      rx={2}
                    />
                    <text
                      x={Math.max(10, x - 45) + 4}
                      y={y + 1.5}
                      fill="#26A69A"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ★ {label.slice(0, 14)}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* Crosshair Cursor on Hover */}
          {hoverIndex !== null && visibleCandles[hoverIndex] && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={margin.left + hoverIndex * candleStep + candleStep / 2}
                y1={margin.top}
                x2={margin.left + hoverIndex * candleStep + candleStep / 2}
                y2={height - margin.bottom}
                stroke="#D1D4DC"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />
              {/* Date Box on X Axis */}
              <rect
                x={margin.left + hoverIndex * candleStep + candleStep / 2 - 28}
                y={height - margin.bottom + 4}
                width={56}
                height={15}
                fill="#2A2E39"
                rx={2}
              />
              <text
                x={margin.left + hoverIndex * candleStep + candleStep / 2}
                y={height - margin.bottom + 15}
                fill="#FFFFFF"
                fontSize="8.5"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {visibleCandles[hoverIndex].date.slice(5)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer: Setup Summary and Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#2A2E39] text-[10px] font-mono text-[#787B86]">
        <div className="flex items-center gap-3">
          <span>
            Universe:{' '}
            <strong className="text-white font-mono">{symbol}</strong>
          </span>
          <span>
            Candles: <strong className="text-white">{visibleCandles.length}</strong> / {rawCandles.length}
          </span>
          {patternName && (
            <span className="text-[#26A69A] bg-[#26A69A]/10 px-1.5 py-0.5 rounded border border-[#26A69A]/20">
              Pattern: {patternName}
            </span>
          )}
        </div>

        {entryPrice && stopLossPrice && (
          <div className="flex items-center gap-2">
            <span className="text-[#26A69A]">Entry: ₹{entryPrice}</span>
            <span className="text-[#EF5350]">SL: ₹{stopLossPrice}</span>
            {target1Price && (
              <span className="text-[#00BCD4]">
                T1: ₹{target1Price} (+{(((target1Price - entryPrice) / entryPrice) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
