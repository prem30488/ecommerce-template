// src/components/CategoryManagement.js
import React, { useState, useEffect } from 'react';
import { Paper, Box } from '@mui/material';
import CategoryManager from './CategoryManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';

const CategoryManagementPage = () => {
  const [privileges, setPrivileges] = useState({});
  const [currentUser, setCurrentUser] = useState();

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

  if (privileges && privileges.categories === true || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") {

  } else {
    return "You are not authorized to view this page. Please contact to Admin to grant you privileges.";
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, md: 4 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 1, sm: 2, md: 3 }, 
          borderRadius: '16px', 
          border: '1px solid', 
          borderColor: 'divider',
          minHeight: '80vh'
        }}
      >
        <CategoryManager />
      </Paper>
    </Box>
  );
};

export default CategoryManagementPage;
