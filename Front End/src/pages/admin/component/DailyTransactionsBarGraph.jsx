import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Paper, Typography } from '@mui/material';
import { useEffect,useState } from 'react';
import {fetchDailyTransactionsCount} from "../../../util/APIUtils"

import Alert from 'react-s-alert';

// const data = [
//   { day: 'Mon', transactions: 50 },
//   { day: 'Tue', transactions: 65 },
//   { day: 'Wed', transactions: 70 },
//   { day: 'Thu', transactions: 55 },
//   { day: 'Fri', transactions: 72 },
//   { day: 'Sat', transactions: 80 },
//   { day: 'Sun', transactions: 60 },
//   // Add more data points for other days
// ];

const DailyTransactionsBarGraph = () => {
 const [data,setData] = useState([]);
  useEffect(() => {

    const getData = async () => {

      fetchDailyTransactionsCount()
      .then(response => {
          setData(response.data);
      })
      .catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
      
    };
    getData();
  }, [data]);
  
  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" align="center">Daily Transactions Bar Graph</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="transactions" />
          <YAxis dataKey="day" type="category" />
          <Tooltip />
          <Bar dataKey="transactions" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DailyTransactionsBarGraph;
