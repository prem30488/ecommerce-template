import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { fetchDashboardSalesOverview } from '../../../util/APIUtils';

const SalesOverview = () => {
  const [activeTab, setActiveTab] = useState('Revenue');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSalesOverview()
      .then(res => {
        setData(res || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching Sales Overview:", err);
        setLoading(false);
      });
  }, []);

  const getChartConfig = () => {
    switch (activeTab) {
      case 'Revenue':
        return {
          color: '#C05621', // Orange/Brownish
          dataKey: 'revenue',
          type: 'area',
          format: (val) => `$${(val / 1000).toFixed(1)}k`
        };
      case 'Orders':
        return {
          color: '#1A535C', // Deep Navy/Teal
          dataKey: 'orders',
          type: 'bar',
          format: (val) => val
        };
      case 'Profit':
        return {
          color: '#38A169', // Green
          dataKey: 'profit',
          type: 'area',
          format: (val) => `$${(val / 1000).toFixed(1)}k`
        };
      default:
        return {};
    }
  };

  const config = getChartConfig();

  return (
    <div className="section-card sales-overview-card" style={{ padding: '24px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h3 className="section-title">Sales Overview</h3>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            Daily performance for the current month
          </p>
        </div>
        <div className="tab-switcher" style={{ 
          background: '#F1F5F9', 
          padding: '4px', 
          borderRadius: '12px', 
          display: 'flex',
          gap: '4px'
        }}>
          {['Revenue', 'Orders', 'Profit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === tab ? '#FFFFFF' : 'transparent',
                color: activeTab === tab ? '#000000' : '#64748B',
                boxShadow: activeTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          {config.type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={config.format}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey={config.dataKey} 
                fill={config.color} 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesOverview;
