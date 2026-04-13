import React from 'react';
import SalesValueChart from './component/SalesValueChart';
import { getCurrentDate } from '../../util/util';
import WeeklySalesGraph from './component/WeeklySalesGraph';
import DailyRevenueBarGraph from './component/DailyRevenueBarGraph';
import DailyTransactionsBarGraph from './component/DailyTransactionsBarGraph';
import CustomerChurnRateGraph from './component/CustomerChurnRateGraph';
import RecentOrders from './component/RecentOrders';
import TopProducts from './component/TopProducts';
import { 
  BestsellersWeek, 
  DiscountCodeWeek, 
  UnfulfilledOrdersWeek, 
  CancellationsWeek, 
  SessionsByLocationWeek, 
  RevenueMonth, 
  OrdersMonth 
} from './component/DashboardMockWidgets';

import { FaChartLine, FaShoppingCart, FaPercentage, FaUserPlus, FaUsers, FaCoins } from 'react-icons/fa';
import { MdOutlineDateRange } from 'react-icons/md';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="premium-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, Admin</h1>
          <p className="dashboard-subtitle">Here's what's happening with your store today.</p>
        </div>
        <div className="dashboard-date">
          <MdOutlineDateRange size={20} color="#6366f1" />
          {getCurrentDate('-')}
        </div>
      </div>

      {/* --- ROW 1: PRIMARY KPIs --- */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-revenue">
          <div className="kpi-card-header">
            <span className="kpi-title">Purchase Revenue</span>
            <div className="kpi-icon-wrapper"><FaChartLine /></div>
          </div>
          <h3 className="kpi-value">164.4k</h3>
        </div>
        <div className="kpi-card kpi-orders">
          <div className="kpi-card-header">
            <span className="kpi-title">E-commerce Purchases</span>
            <div className="kpi-icon-wrapper"><FaShoppingCart /></div>
          </div>
          <h3 className="kpi-value">3.0k</h3>
        </div>
        <div className="kpi-card kpi-conversion">
          <div className="kpi-card-header">
            <span className="kpi-title">Purchaser Rate</span>
            <div className="kpi-icon-wrapper"><FaPercentage /></div>
          </div>
          <h3 className="kpi-value">2.6%</h3>
        </div>
        <div className="kpi-card kpi-customers">
          <div className="kpi-card-header">
            <span className="kpi-title">First Time Purchasers</span>
            <div className="kpi-icon-wrapper"><FaUserPlus /></div>
          </div>
          <h3 className="kpi-value">2.0k</h3>
        </div>
        <div className="kpi-card kpi-customers">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Purchasers</span>
            <div className="kpi-icon-wrapper"><FaUsers /></div>
          </div>
          <h3 className="kpi-value">2.5k</h3>
        </div>
        <div className="kpi-card kpi-revenue">
          <div className="kpi-card-header">
            <span className="kpi-title">Avg Revenue / User</span>
            <div className="kpi-icon-wrapper"><FaCoins /></div>
          </div>
          <h3 className="kpi-value">1.7</h3>
        </div>
      </div>

      {/* --- ROW 2: FINANCIAL OVERVIEW --- */}
      <h2 className="section-divider-title">Financial Overview</h2>
      <div className="dashboard-row-primary">
        <div className="dashboard-col-main">
          <div className="chart-wrapper">
            <SalesValueChart />
          </div>
        </div>
        <div className="dashboard-col-sidebar">
          <RevenueMonth />
          <OrdersMonth />
          <DiscountCodeWeek />
        </div>
      </div>

      {/* --- ROW 3: ORDER FULFILLMENT --- */}
      <h2 className="section-divider-title">Fulfillment & Alerts</h2>
      <div className="dashboard-row-primary">
        <div className="dashboard-col-main">
          <RecentOrders />
        </div>
        <div className="dashboard-col-sidebar">
          <UnfulfilledOrdersWeek />
          <CancellationsWeek />
          <div className="chart-wrapper">
            <CustomerChurnRateGraph />
          </div>
        </div>
      </div>

      {/* --- ROW 4: SALES TRENDS --- */}
      <h2 className="section-divider-title">Sales Trends</h2>
      <div className="dashboard-row-secondary">
        <div className="chart-wrapper"><WeeklySalesGraph /></div>
        <div className="chart-wrapper"><DailyRevenueBarGraph /></div>
        <div className="chart-wrapper"><DailyTransactionsBarGraph /></div>
      </div>

      {/* --- ROW 5: PRODUCT & AUDIENCE INSIGHTS --- */}
      <h2 className="section-divider-title">Product & Audience Insights</h2>
      <div className="dashboard-row-primary">
        <div className="dashboard-col-main">
          <div className="product-compare-grid">
            <TopProducts />
            <BestsellersWeek />
          </div>
        </div>
        <div className="dashboard-col-sidebar">
          <SessionsByLocationWeek />
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
