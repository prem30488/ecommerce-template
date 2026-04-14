import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardSalesByCategory } from '../../../util/APIUtils';

const SalesByCategoryChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchDashboardSalesByCategory()
      .then(res => setData(res || []))
      .catch(err => console.error("Error fetching sales by category:", err));
  }, []);

  const formatYAxis = (tickItem) => {
    if (tickItem === 0) return '$0';
    if (tickItem < 1000) return `$${tickItem}`;
    return `$${(tickItem / 1000).toFixed(1)}k`;
  };

  return (
    <div className="section-card" style={{ padding: '24px' }}>
      <div className="section-header" style={{ marginBottom: '25px' }}>
        <div>
          <h3 className="section-title">Sales by Category</h3>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            Revenue distribution across product types
          </p>
        </div>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            barSize={25}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <YAxis 
              dataKey="category" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 13, fontWeight: 500 }}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
            <Bar 
              dataKey="revenue" 
              fill="#0D9488" 
              radius={[0, 4, 4, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesByCategoryChart;
