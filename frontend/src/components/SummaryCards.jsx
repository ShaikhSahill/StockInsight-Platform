import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart2 } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: '52-Week High',
      value: `$${summary.high_52week.toFixed(2)}`,
      icon: <TrendingUp size={20} color="var(--success-color)" />,
      color: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: '52-Week Low',
      value: `$${summary.low_52week.toFixed(2)}`,
      icon: <TrendingDown size={20} color="var(--danger-color)" />,
      color: 'rgba(239, 68, 68, 0.1)'
    },
    {
      title: '30D Avg Close',
      value: `$${summary.avg_close_30d.toFixed(2)}`,
      icon: <DollarSign size={20} color="var(--accent-color)" />,
      color: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Volatility Score',
      value: `${(summary.volatility_30d * 100).toFixed(2)}%`,
      icon: <Activity size={20} color="#f59e0b" />,
      color: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  if (summary.predicted_next_close) {
    cards.push({
      title: 'AI Prediction (Next)',
      value: `$${summary.predicted_next_close.toFixed(2)}`,
      icon: <BarChart2 size={20} color="#ec4899" />,
      color: 'rgba(236, 72, 153, 0.1)'
    });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="glass-panel"
          style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <div style={{ background: card.color, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {card.icon}
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>{card.title}</p>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{card.value}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
