import React, { useState, useEffect } from 'react';
import { FaCircle } from 'react-icons/fa';
import { fetchOrders } from '../../../util/APIUtils';
import { formatCurrency } from '../../../util/regionalSettings';
import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return '#10b981'; // green
    case 'Processing': return '#3b82f6'; // blue
    case 'Shipped': return '#f59e0b'; // orange
    case 'Pending': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
};

const RecentOrders = () => {

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchOrders(0, 5).then((data) => {
      if (data && data.content) {
        setRecentOrders(data.content);
      }
    }).catch(err => console.error("RecentOrders fetch error: ", err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Recent Orders</h3>
        <Link to="/orderManagement" className="btn-view-all" style={{ textDecoration: 'none' }}>View All</Link>
      </div>
      <div className="table-responsive">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, idx) => (
              <tr key={idx}>
                <td className="font-semibold">#{order.id}</td>
                <td>{order.customer?.name || 'Guest'}</td>
                <td className="text-muted">{new Date(order.createdAt || order.created_at).toLocaleDateString()}</td>
                <td className="font-semibold">{formatCurrency(order.total)}</td>
                <td>
                  <span className="status-badge" style={{ color: getStatusColor(order.status), backgroundColor: `${getStatusColor(order.status)}15` }}>
                    <FaCircle size={8} style={{ marginRight: '6px' }} />
                    {order.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No recent orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
