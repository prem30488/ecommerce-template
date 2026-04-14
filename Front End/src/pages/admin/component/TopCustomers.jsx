import React, { useState, useEffect } from 'react';
import { fetchDashboardTopCustomers } from '../../../util/APIUtils';
import { Link } from 'react-router-dom';

const TopCustomers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchDashboardTopCustomers()
      .then(res => setCustomers(res || []))
      .catch(err => console.error("Error fetching top customers:", err));
  }, []);

  return (
    <div className="section-card" style={{ padding: '24px' }}>
      <div className="section-header" style={{ marginBottom: '25px' }}>
        <div>
          <h3 className="section-title">Top Customers</h3>
          <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Best performers by total spend
          </p>
        </div>
        <Link to="/userManagement" className="btn-view-all" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
          View all <span style={{ fontSize: '18px' }}>→</span>
        </Link>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              <th style={{ padding: '12px 10px', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>#</th>
              <th style={{ padding: '12px 10px', color: '#64748B', fontWeight: '600', fontSize: '0.85rem' }}>Customer</th>
              <th style={{ padding: '12px 10px', color: '#64748B', fontWeight: '600', fontSize: '0.85rem', textAlign: 'center' }}>Won</th>
              <th style={{ padding: '12px 10px', color: '#64748B', fontWeight: '600', fontSize: '0.85rem', textAlign: 'center' }}>Revenue</th>
              <th style={{ padding: '12px 10px', color: '#64748B', fontWeight: '600', fontSize: '0.85rem', textAlign: 'right' }}>Activity</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, idx) => {
              // Generate a mock activity percentage based on rank for visual consistency with photo
              const activity = 100 - (idx * 15) - Math.floor(Math.random() * 5); 
              
              return (
                <tr key={idx} style={{ borderBottom: idx === customers.length - 1 ? 'none' : '1px solid #F8FAFC' }}>
                  <td style={{ padding: '16px 10px', color: '#64748B', fontSize: '0.9rem' }}>{idx + 1}</td>
                  <td style={{ padding: '16px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: '#F1F5F9', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: '#475569'
                      }}>
                        {customer.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.95rem' }}>{customer.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          {customer.email} • {customer.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 10px', textAlign: 'center', fontWeight: '800', color: '#0F172A' }}>{customer.orders}</td>
                  <td style={{ padding: '16px 10px', textAlign: 'center', fontWeight: '800', color: '#0F172A' }}>₹{customer.revenue.toLocaleString()}</td>
                  <td style={{ padding: '16px 10px', textAlign: 'right' }}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                        <div style={{ width: '60px', height: '6px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                           <div style={{ width: `${activity}%`, height: '100%', background: '#C05621', borderRadius: '10px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600', minWidth: '35px' }}>{activity}%</span>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopCustomers;
