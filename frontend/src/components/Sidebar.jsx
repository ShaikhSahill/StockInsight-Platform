import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

export default function Sidebar({ companies, selectedCompany, onSelectCompany, searchQuery, setSearchQuery }) {
  return (
    <div className="sidebar" style={{ 
      width: '280px', 
      borderRight: '1px solid var(--glass-border)', 
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity color="var(--accent-color)" size={28} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '0.5px' }}>FinX Platform</h2>
      </div>
      
      <div>
        <input 
          type="text" 
          placeholder="Search stocks..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'var(--panel-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {companies.map(company => (
          <motion.div
            key={company.symbol}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCompany(company.symbol)}
            className="glass-panel"
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              background: selectedCompany === company.symbol ? 'var(--panel-bg-hover)' : 'var(--panel-bg)',
              borderColor: selectedCompany === company.symbol ? 'var(--accent-color)' : 'var(--glass-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{company.symbol}</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {company.name}
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '6px', display: 'inline-block', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
              {company.sector}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
