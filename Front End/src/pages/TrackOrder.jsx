// src/components/ProductManagement.js
import React , {useState,useEffect} from 'react';
import { Paper, Typography } from '@mui/material';
import { CssBaseline, Container } from '@mui/material';

const TrackOrder = () => {

  return (
    
    <Container>
      <div style={{paddingTop:"150px"}}></div> 
    <CssBaseline />"
    <Paper elevation={3} style={{ padding: '20px', height: "100%" }}>
      <Typography variant="h5" align="center">Track Order</Typography>
      {/* <ProductManagement categories={categories} /> */}
      <bluedart-tracking-component tracking-number="75484923054" checkpoints="true" />
    
    </Paper>
    </Container>
  );
};

export default TrackOrder;
