import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';
import { useEffect,useState } from 'react';
import {fetchMonthlySalesSum} from "../../../util/APIUtils"

import Alert from 'react-s-alert';

// const data = [
//   { name: 'Jan', sales: 2000 },
//   { name: 'Feb', sales: 1500 },
//   { name: 'Mar', sales: 2500 },
//   { name: 'Apr', sales: 1800 },
//   { name: 'May', sales: 3500 },
//   { name: 'Jun', sales: 4200 },
//   { name: 'Jul', sales: 4500 },
//   { name: 'Aug', sales: 3200 },
//   { name: 'Sep', sales: 2200 },
//   // Add more data points for other months
// ];

const SalesValueChart = () => {
  const [data,setData] = useState([]);

  useEffect(() => {

    const getData = async () => {

      fetchMonthlySalesSum()
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
      <Typography variant="h5" align="center">Sales Value Chart - Monthly</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default SalesValueChart;
