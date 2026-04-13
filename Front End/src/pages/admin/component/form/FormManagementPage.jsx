// src/components/CategoryManagement.js
import React , {useState,useEffect} from 'react';
import { Paper, Typography } from '@mui/material';
import { CssBaseline, Container } from '@mui/material';
import ItemManager from './ItemManager';
import {getCurrentUser, getPrivileges} from '../../../../util/APIUtils';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';

const FormManagementPage = () => {
  const [privileges, setPrivileges] = useState({});  
  const [currentUser,setCurrentUser] = useState();

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        const privilegesData = await getPrivileges(user.id);
        setPrivileges({
          id: privilegesData.id,
          userId: privilegesData.user_id,
          categories: privilegesData.categories,
          forms: privilegesData.forms, 
          products: privilegesData.products,
          orders: privilegesData.orders,
          coupons: privilegesData.coupons,
          testimonials: privilegesData.testimonials,
          deleteFlag: privilegesData.deleteFlag
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      }
    };
    fetchPrivileges();
  }, []);

  if(privileges && privileges.forms === true || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"){

  }else{
    return "You are not authorized to view this page. Please contact to Admin to grant you privileges.";
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    <CssBaseline />
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" align="center">Form Management</Typography>
      {/* Category management content */}
      <ItemManager/>
    </Paper>
    </Container>
  );
};

export default FormManagementPage;
