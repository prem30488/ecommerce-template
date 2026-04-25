import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
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
        Weekly Sales
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider, rgba(0,0,0,0.1))" />
          <XAxis 
            dataKey="week" 
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
          <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySalesGraph;
