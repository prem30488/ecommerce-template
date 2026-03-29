import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Paper, List, ListItem, ListItemText, Drawer, Divider, Card } from '@mui/material';
import { Menu, Home, ShoppingCart, Assignment, People, Lock, GifTwoTone, Category } from '@mui/icons-material';

import SalesValueChart from './component/SalesValueChart';
import { getCurrentDate } from '../../util/util';
import WeeklySalesGraph from './component/WeeklySalesGraph';
import DailyRevenueBarGraph from './component/DailyRevenueBarGraph';
import DailyTransactionsBarGraph from './component/DailyTransactionsBarGraph';
import CustomerChurnRateGraph from './component/CustomerChurnRateGraph';
import { FaBlog, FaFileContract, FaGoodreads } from 'react-icons/fa';

const Dashboard = () => {

  return (
    <div>
      <Container>
        <Paper style={{ padding: '20px' }}>
          <Typography variant="h4">Welcome to the Dashboard</Typography>
          <Divider />
          <p>{getCurrentDate('-')}</p>
          <DailyTransactionsBarGraph />
          <SalesValueChart />
          <WeeklySalesGraph />
          <DailyRevenueBarGraph />
          <CustomerChurnRateGraph />
        </Paper>
      </Container>
    </div>
  );
}

export default Dashboard;
