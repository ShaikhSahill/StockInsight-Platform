import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StockChart from '../components/StockChart';
import SummaryCards from '../components/SummaryCards';
import { getCompanies, getStockData, getStockSummary } from '../services/api';
import DailyReturnsChart from '../components/DailyReturnsChart';
import AnalyticsPanel from '../components/AnalyticsPanel';
import CompareWidget from '../components/CompareWidget';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [daysFilter, setDaysFilter] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredCompanies(companies.filter(c => 
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, companies]);

  useEffect(() => {
    if (selectedCompany) {
      fetchStockMetrics(selectedCompany, daysFilter);
    }
  }, [selectedCompany, daysFilter]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      setCompanies(res.data);
      if (res.data.length > 0) {
        setSelectedCompany(res.data[0].symbol);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Cannot connect to backend API OR no data available. Backend might be scraping data on first launch.');
      setLoading(false);
    }
  };

  const fetchStockMetrics = async (symbol, days) => {
    try {
      const [dataRes, summaryRes] = await Promise.all([
        getStockData(symbol, days),
        getStockSummary(symbol)
      ]);
      setChartData(dataRes.data.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch data for ${symbol}`);
    }
  };

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>{error}</h2>
        <button className="btn" onClick={() => { setError(null); fetchCompanies(); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCcw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar 
        companies={filteredCompanies} 
        selectedCompany={selectedCompany} 
        onSelectCompany={setSelectedCompany}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {loading && !selectedCompany ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
               <RefreshCcw size={32} color="var(--accent-color)" />
             </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
                  {companies.find(c => c.symbol === selectedCompany)?.name || selectedCompany} Dashboard
                </h1>
                <p className="text-muted">Real-time analytical insights and predictions</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className={`btn ${daysFilter === 30 ? 'active' : ''}`} onClick={() => setDaysFilter(30)}>30 Days</button>
                <button className={`btn ${daysFilter === 90 ? 'active' : ''}`} onClick={() => setDaysFilter(90)}>90 Days</button>
              </div>
            </div>

            <SummaryCards summary={summary} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <StockChart data={chartData} symbol={selectedCompany} />
                <DailyReturnsChart data={chartData} symbol={selectedCompany} />
              </div>
              <div style={{ flex: '1 1 350px' }}>
                <AnalyticsPanel data={chartData} summary={summary} />
              </div>
            </div>

            <CompareWidget companies={companies} />
            
          </motion.div>
        )}
      </div>
    </div>
  );
}
