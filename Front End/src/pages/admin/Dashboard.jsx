import React, { useState, useEffect } from 'react';
import SalesValueChart from './component/SalesValueChart';
import SalesOverview from './component/SalesOverview';
import OrderStatusPieChart from './component/OrderStatusPieChart';
import SalesByCategoryChart from './component/SalesByCategoryChart';
import RevenueTargets from './component/RevenueTargets';
import TopCustomers from './component/TopCustomers';
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

import { FaChartLine, FaShoppingCart, FaPercentage, FaUserPlus, FaUsers, FaCoins, FaUndo } from 'react-icons/fa';
import { LuTrendingDown } from "react-icons/lu";
import { MdOutlineDateRange } from 'react-icons/md';
import { fetchDashboardKPIs } from '../../util/APIUtils';
import { formatCurrency, formatDate } from '../../util/regionalSettings';
import './Dashboard.css';

const Dashboard = () => {
  const [kpiData, setKpiData] = useState({
    purchaseRevenue: 0,
    ecommercePurchases: 0,
    purchaserRate: 0,
    firstTimePurchasers: 0,
    totalPurchasers: 0,
    avgRevenuePerUser: 0,
    refundRate: 0
  });

  useEffect(() => {
    fetchDashboardKPIs()
      .then(res => setKpiData(res || {}))
      .catch(err => console.error("Error fetching KPIs:", err));
  }, []);

  const formatNumber = (num, isCurrency = false) => {
    const val = Number(num) || 0;
    if (isCurrency) {
      if (val >= 1000000) return formatCurrency(val / 1000000).replace(/(\d+(\.\d+)?)/, '$1m').replace('.00m', 'm');
      if (val >= 1000) return formatCurrency(val / 1000).replace(/(\d+(\.\d+)?)/, '$1k').replace('.00k', 'k');
      return formatCurrency(val);
    }
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'm';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return val.toLocaleString();
  };

  return (
    <div className="premium-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome back, Admin</h1>
          <p className="dashboard-subtitle">Here's what's happening with your store today.</p>
        </div>
        <div className="dashboard-date">
          <MdOutlineDateRange size={20} color="#6366f1" />
          {formatDate(new Date())}
        </div>
      </div>

      {/* --- ROW 1: PRIMARY KPIs --- */}
      <div className="kpi-grid">
        <div className="kpi-card kpi-revenue">
          <div className="kpi-card-header">
            <span className="kpi-title">Purchase Revenue</span>
            <div className="kpi-icon-wrapper"><FaChartLine /></div>
          </div>
          <h3 className="kpi-value">{formatNumber(kpiData.purchaseRevenue, true)}</h3>
        </div>
        <div className="kpi-card kpi-orders">
          <div className="kpi-card-header">
            <span className="kpi-title">E-commerce Purchases</span>
            <div className="kpi-icon-wrapper"><FaShoppingCart /></div>
          </div>
          <h3 className="kpi-value">{formatNumber(kpiData.ecommercePurchases)}</h3>
        </div>
        <div className="kpi-card kpi-conversion">
          <div className="kpi-card-header">
            <span className="kpi-title">Purchaser Rate</span>
            <div className="kpi-icon-wrapper"><FaPercentage /></div>
          </div>
          <h3 className="kpi-value">{Number(kpiData.purchaserRate || 0).toFixed(1)}%</h3>
        </div>

        {/* --- REFUND RATE CARD --- */}
        <div className="kpi-card kpi-refund">
          <div className="kpi-card-header">
            <span className="kpi-title">Refund Rate</span>
            <div className="kpi-icon-wrapper refund-icon"><FaUndo /></div>
          </div>
          <h3 className="kpi-value">{Number(kpiData.refundRate || 0).toFixed(1)}%</h3>
          <div className="kpi-trend trend-down">
            <LuTrendingDown size={14} />
            <span>-0.3%</span>
          </div>
          <div className="kpi-card-wave"></div>
        </div>
        <div className="kpi-card kpi-customers">
          <div className="kpi-card-header">
            <span className="kpi-title">First Time Purchasers</span>
            <div className="kpi-icon-wrapper"><FaUserPlus /></div>
          </div>
          <h3 className="kpi-value">{formatNumber(kpiData.firstTimePurchasers)}</h3>
        </div>
        <div className="kpi-card kpi-customers">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Purchasers</span>
            <div className="kpi-icon-wrapper"><FaUsers /></div>
          </div>
          <h3 className="kpi-value">{formatNumber(kpiData.totalPurchasers)}</h3>
        </div>
        <div className="kpi-card kpi-revenue">
          <div className="kpi-card-header">
            <span className="kpi-title">Avg Revenue / User</span>
            <div className="kpi-icon-wrapper"><FaCoins /></div>
          </div>
          <h3 className="kpi-value">{formatNumber(kpiData.avgRevenuePerUser, true)}</h3>
        </div>
      </div>

      {/* --- ROW 2: FINANCIAL OVERVIEW --- */}
      <h2 className="section-divider-title">Financial Overview</h2>
      <div className="dashboard-row-primary">
        <div className="dashboard-col-main">
          <div className="chart-wrapper">
            <SalesValueChart />
          </div>
          <div className="chart-wrapper" style={{ marginTop: '1.5rem' }}>
            <SalesOverview />
          </div>
          <div className="chart-wrapper" style={{ marginTop: '1.5rem' }}>
            <TopCustomers />
          </div>
        </div>
        <div className="dashboard-col-sidebar">
          <OrderStatusPieChart />
          <RevenueTargets kpiData={kpiData} />
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
            <SalesByCategoryChart />
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
