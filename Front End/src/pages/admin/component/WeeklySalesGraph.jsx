import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import { useEffect,useState } from 'react';
import {fetchWeeklySalesSum} from "../../../util/APIUtils"

import Alert from 'react-s-alert';
// const data = [
//   { week: 'Week 1', sales: 2000 },
//   { week: 'Week 2', sales: 1500 },
//   { week: 'Week 3', sales: 2500 },
//   { week: 'Week 4', sales: 1800 },
//   // Add more data points for other weeks
// ];

const WeeklySalesGraph = () => {

  const [data,setData] = useState([]);
  useEffect(() => {

    const getData = async () => {

      fetchWeeklySalesSum()
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
      <Typography variant="h5" align="center">Weekly Sales Graph</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default WeeklySalesGraph;
