import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { Paper, Typography } from '@mui/material';
import { useEffect,useState } from 'react';
import {fetchDailyRevenueSum} from "../../../util/APIUtils"

import Alert from 'react-s-alert';

//   { day: 'Mon', revenue: 500 },
//   { day: 'Tue', revenue: 800 },
//   { day: 'Wed', revenue: 1200 },
//   { day: 'Thu', revenue: 950 },
//   { day: 'Fri', revenue: 1300 },
//   { day: 'Sat', revenue: 1600 },
//   { day: 'Sun', revenue: 1100 },
//   // Add more data points for other days
// ];
const DailyRevenueBarGraph = () => {
  const [data,setData] = useState([]);

  useEffect(() => {

    const getData = async () => {

      fetchDailyRevenueSum()
      .then(response => {
      console.log("data : :"+ JSON.stringify(response.data));
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
      <Typography variant="h5" align="center">Daily Revenue Bar Graph</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day">
            <Label value="Days of the Week" offset={0} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label angle={270} value="Revenue" position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip />
          <Bar dataKey="revenue" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default DailyRevenueBarGraph;
