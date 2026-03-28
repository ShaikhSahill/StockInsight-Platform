import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AnalyticsPanel(props) {
  if (!props.data || !props.summary || !props.data.length) return null;
  return <AnalyticsPanelInner {...props} />;
}

function AnalyticsPanelInner({ data, summary }) {
  const [piePeriod, setPiePeriod] = useState('1M'); // '1W', '1M', 'ALL'

  // Pie Chart filtered data
  const pieSlicedData = useMemo(() => {
    if (piePeriod === '1W') return data.slice(Math.max(0, data.length - 5)); // 5 trading days = 1 week
    if (piePeriod === '1M') return data.slice(Math.max(0, data.length - 21)); // 21 trading days = 1 month
    return data;
  }, [data, piePeriod]);

  const { profitDays, lossDays } = useMemo(() => {
    let p = 0, l = 0;
    pieSlicedData.forEach(d => {
      if (d.daily_return >= 0) p++;
      else l++;
    });
    return { profitDays: p, lossDays: l };
  }, [pieSlicedData]);

  const pieDataArray = [
    { name: 'Profit Days (Buy Context)', value: profitDays },
    { name: 'Loss Days (Sell Context)', value: lossDays }
  ];
  const COLORS = ['#10b981', '#ef4444'];
  
  // Calculate specific signal for the chosen period
  // For 1D, we look at the last day. For 1W, we look at where it was 1 week ago.
  const getPeriodSignalText = () => {
    const historicalPoint = pieSlicedData[0]; // the start of the selected slice
    if (!historicalPoint) return { text: '-', color: 'var(--text-secondary)' };
    return historicalPoint.close >= historicalPoint.ma_7 
      ? { text: 'BUY SIGNAL', color: 'var(--success-color)' }
      : { text: 'SELL SIGNAL', color: 'var(--danger-color)' };
  };
  const periodSignal = getPeriodSignalText();

  // Radar Data Logic (Always full period)
  const radarData = useMemo(() => {
    let p = 0; let l = 0;
    data.forEach(d => { if (d.daily_return >= 0) p++; else l++; });
    const winRate = (p / (p + l || 1)) * 100;
    const currentPrice = data[data.length - 1].close;
    const range = summary.high_52week - summary.low_52week;
    let rangePos = 50;
    if (range > 0) {
      rangePos = ((currentPrice - summary.low_52week) / range) * 100;
      rangePos = Math.max(0, Math.min(100, rangePos));
    }
    let actionScore = (summary.volatility_30d / 0.8) * 100;
    actionScore = Math.max(0, Math.min(100, actionScore));
    const maDist = ((currentPrice - summary.avg_close_30d) / summary.avg_close_30d) * 100;
    let momentum = ((maDist + 10) / 20) * 100;
    momentum = Math.max(0, Math.min(100, momentum));
    const firstClose = data[0].close;
    const periodReturn = ((currentPrice - firstClose) / firstClose) * 100;
    let trend = ((periodReturn + 15) / 30) * 100;
    trend = Math.max(0, Math.min(100, trend));

    return [
      { subject: 'Win Rate', A: Math.round(winRate), fullMark: 100 },
      { subject: '52w High Prox.', A: Math.round(rangePos), fullMark: 100 },
      { subject: 'Volatility', A: Math.round(actionScore), fullMark: 100 },
      { subject: 'Momentum', A: Math.round(momentum), fullMark: 100 },
      { subject: 'Trend', A: Math.round(trend), fullMark: 100 },
    ];
  }, [data, summary]);


  // Technical Signals Logic
  const currentData = data[data.length - 1];
  const currentPrice = currentData.close;
  const closes = data.map(d => d.close);
  const support = Math.min(...closes);
  const resistance = Math.max(...closes);

  const isBullish = currentPrice >= currentData.ma_7;
  const trendStatus = isBullish ? 'Bullish Setup' : 'Bearish Setup';
  const trendColor = isBullish ? 'var(--success-color)' : 'var(--danger-color)';
  const TrendIcon = isBullish ? ArrowUpRight : ArrowDownRight;

  const distanceToHigh = (((summary.high_52week - currentPrice) / currentPrice) * 100).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* Technical Signals Card - REPLACED TRADER PERSONA */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel" 
        style={{ padding: '24px', borderTop: `4px solid var(--accent-color)` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: `rgba(59, 130, 246, 0.2)`, padding: '10px', borderRadius: '50%' }}>
            <Activity color="var(--accent-color)" size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Price Action Analysis</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Short-Term Trend <span style={{fontSize: '0.75rem'}}>(vs MA)</span></div>
            <div style={{ color: trendColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {trendStatus} <TrendIcon size={16} />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Local Support (Low)</div>
            <div style={{ fontWeight: '600' }}>${support.toFixed(2)}</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Local Resistance (High)</div>
            <div style={{ fontWeight: '600' }}>${resistance.toFixed(2)}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Room to 52W High</div>
            <div style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>+{Math.max(0, distanceToHigh)}% upside</div>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart: Asset DNA */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel" 
        style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}
      >
        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Asset DNA</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Dynamic multi-dimensional performance shape.</p>
        
        <div style={{ flex: 1, minHeight: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="var(--glass-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Stock Metrics" dataKey="A" stroke="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.4} />
              <PieTooltip 
                contentStyle={{ background: 'rgba(20,26,40,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: 'var(--accent-color)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie Chart: Interactive Win Rate & Signal Options */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-panel" 
        style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Performance Ratio</h3>
          {/* Options for 1W, 1M, ALL */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['1W', '1M', 'ALL'].map(p => (
              <button 
                key={p} 
                onClick={() => setPiePeriod(p)}
                style={{
                  background: piePeriod === p ? 'var(--accent-color)' : 'transparent',
                  border: '1px solid var(--accent-color)',
                  color: piePeriod === p ? '#fff' : 'var(--text-secondary)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  outline: 'none'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
          Win rate & generated Signal for {piePeriod.replace('1W', 'the past 1 Week').replace('1M', 'the past 1 Month').replace('ALL', 'the entire period')}.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem' }}>Calculated Signal Taken: &nbsp;</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: periodSignal.color }}>{periodSignal.text}</span>
        </div>
        
        <div style={{ flex: 1, minHeight: '200px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieDataArray}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieDataArray.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <PieTooltip 
                contentStyle={{ background: 'rgba(20,26,40,0.9)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
              {Math.round((profitDays / (profitDays + lossDays || 1)) * 100)}%
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Win Rate</p>
          </div>
        </div>
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[0] }} />
            <span style={{ fontSize: '0.9rem' }}>Buy Ratio ({profitDays}d)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[1] }} />
            <span style={{ fontSize: '0.9rem' }}>Sell Ratio ({lossDays}d)</span>
          </div>
        </div>

      </motion.div>

    </div>
  );
}
