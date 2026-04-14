import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTicketAlt, FaExclamationCircle, FaTimesCircle, FaChartPie, FaChartLine, FaBoxOpen } from 'react-icons/fa';
import { fetchDashboardDiscountCodes, fetchDashboardOrderStatsWeek, fetchDashboardMonthlyStats, fetchDashboardProductAudience } from '../../../util/APIUtils';

export const BestsellersWeek = () => {
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    fetchDashboardProductAudience()
      .then(res => setBestsellers(res.bestsellers || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Bestsellers - This week</h3>
      </div>
      <ul className="top-products-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
        {bestsellers.length > 0 ? (
          bestsellers.map((product, idx) => (
            <li className="product-item" key={idx} style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
              <img 
                src={product.image || '/images/placeholder.png'} 
                alt={product.name} 
                style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', marginRight: '15px' }} 
              />
              <div className="product-info">
                <h4 className="product-name" style={{ margin: 0 }}>{product.name}</h4>
                <span className="product-category">{product.category}</span>
              </div>
              <div className="product-stats" style={{ marginLeft: 'auto' }}>
                <div className="product-sales">{product.sales} Sales</div>
              </div>
            </li>
          ))
        ) : (
          <p className="text-muted" style={{padding: '1rem'}}>No sales recorded this week</p>
        )}
      </ul>
    </div>
  );
};

export const DiscountCodeWeek = () => {
  const [discountStats, setDiscountStats] = useState([]);

  useEffect(() => {
    fetchDashboardDiscountCodes()
      .then(res => setDiscountStats(res || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Discount Code - This week</h3>
        <FaTicketAlt color="#6366f1" size={20} />
      </div>
      <div className="table-responsive">
        <table className="premium-table">
          <thead>
            <tr><th>Code</th><th>Uses</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            {discountStats.length > 0 ? (
              discountStats.map((stat, i) => (
                <tr key={i}>
                  <td className="font-semibold">{stat.code}</td>
                  <td>{stat.uses}</td>
                  <td className="font-semibold">₹{Number(stat.revenue).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" style={{textAlign:"center", color:"#aaa"}}>No discount codes used this week</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const UnfulfilledOrdersWeek = () => {
  const [unfulfilled, setUnfulfilled] = useState(0);

  useEffect(() => {
    fetchDashboardOrderStatsWeek()
      .then(res => setUnfulfilled(res.unfulfilled || 0))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Unfulfilled Orders - This week</h3>
        <FaExclamationCircle color="#f59e0b" size={20} />
      </div>
      <div className="kpi-value">{unfulfilled}</div>
      <p className="text-muted" style={{marginTop: '0.5rem'}}>Requires attention</p>
    </div>
  );
};

export const CancellationsWeek = () => {
  const [stats, setStats] = useState({ cancellations: 0, percent: 0 });

  useEffect(() => {
    fetchDashboardOrderStatsWeek()
      .then(res => setStats({ 
        cancellations: res.cancellations || 0, 
        percent: res.cancellationsPercentVsLastWeek || 0 
      }))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Cancellations - This week</h3>
        <FaTimesCircle color="#ef4444" size={20} />
      </div>
      <div className="kpi-value">{stats.cancellations}</div>
      <p className="text-muted" style={{marginTop: '0.5rem'}}>
        {stats.percent > 0 ? '+' : ''}{Number(stats.percent).toFixed(1)}% vs last week
      </p>
    </div>
  );
};

export const SessionsByLocationWeek = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchDashboardProductAudience()
      .then(res => setLocations(res.locations || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Sessions by Location - This week</h3>
        <FaMapMarkerAlt color="#8b5cf6" size={20} />
      </div>
      <ul className="top-products-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
        {locations.length > 0 ? (
          locations.map((loc, idx) => (
            <li className="product-item" key={idx}>
              <div className="product-info"><h4 className="product-name">{loc.name}</h4></div>
              <div className="product-stats font-semibold">{loc.count} orders</div>
            </li>
          ))
        ) : (
          <p className="text-muted" style={{padding: '1rem'}}>Insufficient location data</p>
        )}
      </ul>
    </div>
  );
};

export const RevenueMonth = () => {
  const [stats, setStats] = useState({ revenue: 0, percent: 0 });

  useEffect(() => {
    fetchDashboardMonthlyStats()
      .then(res => setStats({ revenue: res.revenue || 0, percent: res.revenuePercent || 0 }))
      .catch(err => console.error(err));
  }, []);

  const formatRevenue = (val) => {
    if (val >= 1000000) return `₹${(val / 1000000).toFixed(1)}m`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val.toFixed(2)}`;
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Revenue - This month</h3>
        <FaChartLine color="#10b981" size={20} />
      </div>
      <div className="kpi-value">{formatRevenue(stats.revenue)}</div>
      <p className="text-muted" style={{marginTop: '0.5rem'}}>
        {stats.percent > 0 ? '+' : ''}{Number(stats.percent).toFixed(1)}% vs last month
      </p>
    </div>
  );
};

export const OrdersMonth = () => {
  const [stats, setStats] = useState({ orders: 0, percent: 0 });

  useEffect(() => {
    fetchDashboardMonthlyStats()
      .then(res => setStats({ orders: res.orders || 0, percent: res.ordersPercent || 0 }))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Orders - This month</h3>
        <FaBoxOpen color="#3b82f6" size={20} />
      </div>
      <div className="kpi-value">{stats.orders.toLocaleString()}</div>
      <p className="text-muted" style={{marginTop: '0.5rem'}}>
        {stats.percent > 0 ? '+' : ''}{Number(stats.percent).toFixed(1)}% vs last month
      </p>
    </div>
  );
};
