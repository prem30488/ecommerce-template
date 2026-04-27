import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { OrderTable } from './OrderTable';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import LinearProgress from '../../../../common/LinearProgress';

const OrderManagementPage = () => {
  const [privileges, setPrivileges] = useState({});
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchPrivileges();
  }, []);

  if (privileges && privileges.orders === true || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") {

  } else {
    return "You are not authorized to view this page. Please contact to Admin to grant you privileges.";
  }

  return (
    <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, md: 4 } }}>
      <LinearProgress loading={loading} />
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
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary', 
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Order Management
        </Typography>
        <OrderTable />
      </Paper>
    </Box>
  );
};

export default OrderManagementPage;
