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
import { useEffect, useState } from 'react';
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
        Daily Revenue
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider, rgba(0,0,0,0.1))" />
          <XAxis 
            dataKey="day"
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
          <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyRevenueBarGraph;
