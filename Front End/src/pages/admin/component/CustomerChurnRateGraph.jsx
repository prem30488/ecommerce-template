import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { Paper, Typography } from '@mui/material';

const data = [
  { month: 'Jan', churnRate: 0.05 },
  { month: 'Feb', churnRate: 0.06 },
  { month: 'Mar', churnRate: 0.04 },
  { month: 'Apr', churnRate: 0.07 },
  { month: 'May', churnRate: 0.05 },
  { month: 'Jun', churnRate: 0.03 },
  // Add more data points for other months
];

const CustomerChurnRateGraph = () => {
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" align="center">Customer Churn Rate Graph</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month">
            <Label value="Months" offset={0} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label angle={270} value="Churn Rate" position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip />
          <Line type="monotone" dataKey="churnRate" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CustomerChurnRateGraph;
