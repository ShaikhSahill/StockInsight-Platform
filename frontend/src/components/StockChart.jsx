import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function StockChart({ data, symbol }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-panel" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">Loading chart data...</p>
      </div>
    );
  }

  const isPositive = data[data.length - 1].close >= data[0].close;
  const gradientColor = isPositive ? '#10b981' : '#ef4444';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '12px', border: '1px solid var(--accent-color)', background: 'rgba(20,26,40,0.9)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {label && label.toString().includes('T') ? label.split('T')[0] : label}
          </p>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Close: ${payload[0].value.toFixed(2)}</p>
          {payload[1] && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#f59e0b' }}>7d Avg: ${payload[1].value.toFixed(2)}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel" style={{ height: '450px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Price History: {symbol}</h3>
      </div>
      <div style={{ flex: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} tickMargin={10} minTickGap={30} tickFormatter={(val) => val && val.toString().includes('T') ? val.split('T')[0] : val} />
            <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" tick={{fontSize: 12}} width={45} tickFormatter={(val) => `$${val}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.9rem' }} />
            <Area name="Closing Price" type="monotone" dataKey="close" stroke={gradientColor} strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
            <Area name="7-Day Moving Avg" type="monotone" dataKey="ma_7" stroke="#f59e0b" strokeWidth={2} fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
