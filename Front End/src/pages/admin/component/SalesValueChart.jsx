import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
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
          setData(response.data);
      })
      .catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
      
    };
    getData();
  }, []);


  return (
    <div style={{ width: '100%', height: '300px', padding: '20px' }}>
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '20px', 
        fontSize: '1.25rem', 
        fontWeight: 800, 
        color: 'var(--color-text, #0f172a)' 
      }}>
        Sales Value - Monthly
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider, rgba(0,0,0,0.1))" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'var(--color-text-secondary, #64748b)', fontSize: 12 }} 
            axisLine={{ stroke: 'var(--color-divider, rgba(0,0,0,0.1))' }}
          />
          <YAxis 
            tick={{ fill: 'var(--color-text-secondary, #64748b)', fontSize: 12 }} 
            axisLine={{ stroke: 'var(--color-divider, rgba(0,0,0,0.1))' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              background: 'var(--color-bg, #fff)', 
              border: '1px solid var(--color-divider, rgba(0,0,0,0.1))',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesValueChart;
