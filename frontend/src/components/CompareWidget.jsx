import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { compareStocks } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function CompareWidget({ companies }) {
  const [symbol1, setSymbol1] = useState(companies[0]?.symbol || '');
  const [symbol2, setSymbol2] = useState(companies[1]?.symbol || '');
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!symbol1 || !symbol2 || symbol1 === symbol2) return;
    try {
      setLoading(true);
      setError(null);
      const res = await compareStocks(symbol1, symbol2);
      setCompareData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch comparison data. Please try again.');
      setLoading(false);
    }
  };

  const MetricRow = ({ label, val1, val2, format = 'number', isLowerBetter = false }) => {
    const isVal1Better = isLowerBetter ? val1 < val2 : val1 > val2;
    const isVal2Better = isLowerBetter ? val2 < val1 : val2 > val1;

    const display1 = format === 'currency' ? `$${val1.toFixed(2)}` : format === 'percent' ? `${(val1 * 100).toFixed(2)}%` : val1;
    const display2 = format === 'currency' ? `$${val2.toFixed(2)}` : format === 'percent' ? `${(val2 * 100).toFixed(2)}%` : val2;

    return (
      <tr>
        <td style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {label}
        </td>
        <td style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ 
            color: isVal1Better ? 'var(--success-color)' : 'var(--text-primary)', 
            fontWeight: isVal1Better ? '600' : '400' 
          }}>{display1}</span>
        </td>
        <td style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ 
            color: isVal2Better ? 'var(--success-color)' : 'var(--text-primary)', 
            fontWeight: isVal2Better ? '600' : '400' 
          }}>{display2}</span>
        </td>
      </tr>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-panel" 
      style={{ padding: '32px', marginTop: '20px' }}
    >
      {/* Header and Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Asset Comparison Matrix</h2>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem' }}>Evaluate statistical correlation and key performance metrics side-by-side.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <select 
            value={symbol1} 
            onChange={(e) => setSymbol1(e.target.value)}
            style={{ 
              padding: '10px 16px', borderRadius: '6px', background: 'var(--panel-bg)', color: 'var(--text-primary)', 
              border: '1px solid var(--glass-border)', fontSize: '0.95rem', outline: 'none', cursor: 'pointer', minWidth: '150px'
            }}
          >
            {companies.map(c => <option key={`1-${c.symbol}`} value={c.symbol}>{c.symbol} - {c.name}</option>)}
          </select>
          
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500', padding: '0 8px' }}>VS</span>
          
          <select 
            value={symbol2} 
            onChange={(e) => setSymbol2(e.target.value)}
            style={{ 
              padding: '10px 16px', borderRadius: '6px', background: 'var(--panel-bg)', color: 'var(--text-primary)', 
              border: '1px solid var(--glass-border)', fontSize: '0.95rem', outline: 'none', cursor: 'pointer', minWidth: '150px'
            }}
          >
            {companies.map(c => <option key={`2-${c.symbol}`} value={c.symbol}>{c.symbol} - {c.name}</option>)}
          </select>

          <button 
            onClick={handleCompare} 
            disabled={loading || symbol1 === symbol2}
            style={{
              padding: '10px 24px', borderRadius: '6px', background: 'var(--accent-color)', color: '#fff', 
              border: '1px solid var(--accent-hover)', cursor: (loading || symbol1 === symbol2) ? 'not-allowed' : 'pointer', 
              fontWeight: '500', fontSize: '0.95rem', marginLeft: 'auto', opacity: (loading || symbol1 === symbol2) ? 0.7 : 1,
              transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {loading && <Loader2 size={16} className="spin" />}
            Compare Assets
          </button>
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger-color)', marginBottom: '24px' }}>{error}</p>}

      <AnimatePresence>
        {compareData && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Correlation Strip */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.02)', 
              padding: '20px 24px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '32px' 
            }}>
              <span style={{ fontWeight: '500', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>90-Day Correlation Match</span>
              <span style={{ 
                fontWeight: '600', fontSize: '1.1rem',
                color: compareData.correlation > 0 ? 'var(--success-color)' : 'var(--danger-color)' 
              }}>
                {compareData.correlation ? (compareData.correlation * 100).toFixed(1) + '%' : 'N/A'}
              </span>
              <div style={{ flex: 1, height: '4px', background: 'var(--panel-bg)', borderRadius: '2px', overflow: 'hidden', marginLeft: '16px' }}>
                <div style={{ 
                  width: `${((compareData.correlation + 1) / 2) * 100}%`, height: '100%', 
                  background: compareData.correlation > 0 ? 'var(--success-color)' : 'var(--danger-color)', 
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                }} />
              </div>
            </div>

            {/* Comparison Matrix Table */}
            
            <div style={{ width: '100%', overflowX: 'auto', }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '16px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: '600', width: '40%' }}>Metric Indicator</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid var(--glass-border)', fontSize: '1.05rem', color: 'var(--text-primary)', width: '30%' }}>{compareData.symbol1}</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid var(--glass-border)', fontSize: '1.05rem', color: 'var(--text-primary)', width: '30%' }}>{compareData.symbol2}</th>
                  </tr>
                </thead>
                <tbody>
                  <MetricRow 
                    label="30D Average Closing Price" 
                    val1={compareData.symbol1_summary.avg_close_30d} 
                    val2={compareData.symbol2_summary.avg_close_30d} 
                    format="currency" 
                  />
                  <MetricRow 
                    label="Volatility Score (Risk)" 
                    val1={compareData.symbol1_summary.volatility_30d} 
                    val2={compareData.symbol2_summary.volatility_30d} 
                    format="percent"
                    isLowerBetter={true} 
                  />
                  <MetricRow 
                    label="52-Week Maximum Peak" 
                    val1={compareData.symbol1_summary.high_52week} 
                    val2={compareData.symbol2_summary.high_52week} 
                    format="currency" 
                  />
                  <MetricRow 
                    label="52-Week Floor Low" 
                    val1={compareData.symbol1_summary.low_52week} 
                    val2={compareData.symbol2_summary.low_52week} 
                    format="currency" 
                    isLowerBetter={false}
                  />
                </tbody>
              </table>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
