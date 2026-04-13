import React from 'react';
import { FaMapMarkerAlt, FaTicketAlt, FaExclamationCircle, FaTimesCircle, FaChartPie, FaChartLine, FaBoxOpen } from 'react-icons/fa';

export const BestsellersWeek = () => (
  <div className="section-card">
    <div className="section-header">
      <h3 className="section-title">Bestsellers - This week</h3>
    </div>
    <ul className="top-products-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
      <li className="product-item">
        <div className="product-info">
          <h4 className="product-name">Wireless Earbuds</h4>
          <span className="product-category">Audio</span>
        </div>
        <div className="product-stats">
          <div className="product-sales">1,240 Sales</div>
        </div>
      </li>
      <li className="product-item">
        <div className="product-info">
          <h4 className="product-name">Smart Watch Series 5</h4>
          <span className="product-category">Wearables</span>
        </div>
        <div className="product-stats">
          <div className="product-sales">890 Sales</div>
        </div>
      </li>
      <li className="product-item">
        <div className="product-info">
          <h4 className="product-name">Noise Canceling Headphones</h4>
          <span className="product-category">Audio</span>
        </div>
        <div className="product-stats">
          <div className="product-sales">650 Sales</div>
        </div>
      </li>
    </ul>
  </div>
);

export const DiscountCodeWeek = () => (
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
          <tr><td className="font-semibold">SAVE20</td><td>342</td><td className="font-semibold">$6,840</td></tr>
          <tr><td className="font-semibold">WELCOME10</td><td>215</td><td className="font-semibold">$2,150</td></tr>
          <tr><td className="font-semibold">FREESHIP</td><td>189</td><td className="font-semibold">$0</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);

export const UnfulfilledOrdersWeek = () => (
  <div className="section-card">
    <div className="section-header">
      <h3 className="section-title">Unfulfilled Orders - This week</h3>
      <FaExclamationCircle color="#f59e0b" size={20} />
    </div>
    <div className="kpi-value">48</div>
    <p className="text-muted" style={{marginTop: '0.5rem'}}>Requires attention</p>
  </div>
);

export const CancellationsWeek = () => (
  <div className="section-card">
    <div className="section-header">
      <h3 className="section-title">Cancellations - This week</h3>
      <FaTimesCircle color="#ef4444" size={20} />
    </div>
    <div className="kpi-value">12</div>
    <p className="text-muted" style={{marginTop: '0.5rem'}}>-2.5% vs last week</p>
  </div>
);

export const SessionsByLocationWeek = () => (
  <div className="section-card">
    <div className="section-header">
      <h3 className="section-title">Sessions by Location - This week</h3>
      <FaMapMarkerAlt color="#8b5cf6" size={20} />
    </div>
    <ul className="top-products-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
      <li className="product-item">
        <div className="product-info"><h4 className="product-name">United States</h4></div>
        <div className="product-stats font-semibold">12.5k</div>
      </li>
      <li className="product-item">
        <div className="product-info"><h4 className="product-name">United Kingdom</h4></div>
        <div className="product-stats font-semibold">4.2k</div>
      </li>
      <li className="product-item">
        <div className="product-info"><h4 className="product-name">Canada</h4></div>
        <div className="product-stats font-semibold">3.8k</div>
      </li>
      <li className="product-item">
        <div className="product-info"><h4 className="product-name">Australia</h4></div>
        <div className="product-stats font-semibold">2.1k</div>
      </li>
    </ul>
  </div>
);

export const RevenueMonth = () => (
  <div className="section-card">
    <div className="section-header">
      <h3 className="section-title">Revenue - This month</h3>
      <FaChartLine color="#10b981" size={20} />
    </div>
    <div className="kpi-value">$182.5k</div>
    <p className="text-muted" style={{marginTop: '0.5rem'}}>+14% vs last month</p>
  </div>
);

export const OrdersMonth = () => (
  <div className="section-card">
    <div className="section-header">
      <h3 className="section-title">Orders - This month</h3>
      <FaBoxOpen color="#3b82f6" size={20} />
    </div>
    <div className="kpi-value">3,450</div>
    <p className="text-muted" style={{marginTop: '0.5rem'}}>+8% vs last month</p>
  </div>
);
