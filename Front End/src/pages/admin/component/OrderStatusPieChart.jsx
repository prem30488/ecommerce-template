import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchDashboardOrderStatus } from '../../../util/APIUtils';

const OrderStatusPieChart = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDashboardOrderStatus()
      .then(res => {
        const chartData = [
          { name: 'Completed', value: res.Completed || 0, color: '#C05621' }, // Orange
          { name: 'Shipped', value: res.Shipped || 0, color: '#7C3AED' }, // Purple
          { name: 'Processing', value: res.Processing || 0, color: '#0D9488' }, // Teal
          { name: 'Pending', value: res.Pending || 0, color: '#1A535C' }, // Navy
          { name: 'Cancelled', value: res.Cancelled || 0, color: '#F6AD55' } // Yellow
        ];
        setData(chartData);
        setTotal(Object.values(res).reduce((a, b) => a + b, 0));
      })
      .catch(err => console.error("Error fetching order status stats:", err));
  }, []);

  return (
    <div className="section-card" style={{ padding: '16px', height: 'fit-content', display: 'flex', flexDirection: 'column' }}>
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <div>
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Order Status</h3>
          <p className="text-muted" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
            Distribution of current orders
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{total}</div>
          <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600' }}>Orders</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignHover: 'center', gap: '10px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }}></div>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '600' }}>{item.name}</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatusPieChart;
