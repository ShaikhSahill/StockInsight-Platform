import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

export default function DailyReturnsChart({ data, symbol }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(d => ({
    ...d,
    daily_return_pct: d.daily_return * 100
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const isPositive = val >= 0;
      return (
        <div className="glass-panel" style={{ padding: '12px', border: `1px solid ${isPositive ? 'var(--success-color)' : 'var(--danger-color)'}`, background: 'rgba(20,26,40,0.9)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: isPositive ? 'var(--success-color)' : 'var(--danger-color)' }}>
            Return: {val.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-panel" style={{ height: '350px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Daily Returns: {symbol}</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>(Close - Open) / Open</p>
      </div>
      <div style={{ flex: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{fontSize: 12}} tickMargin={10} minTickGap={30} />
            <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} tickFormatter={(val) => `${val}%`} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
            <Bar dataKey="daily_return_pct" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.daily_return_pct >= 0 ? 'var(--success-color)' : 'var(--danger-color)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
