import React, { useState, useEffect } from 'react';
import { Paper, Box } from '@mui/material';
import MenuManager from './MenuManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import LinearProgress from '../../../../common/LinearProgress';

const MenuManagerPage = () => {
  const [currentUser, setCurrentUser] = useState();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        // Logic for authorization - superadmin or privileges
        if (user.roles[0].name === "ROLE_SUPERADMIN") {
          setAuthorized(true);
        } else {
           const privilegesData = await getPrivileges(user.id);
           if(privilegesData.categories === true) {
              setAuthorized(true);
           }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.error('Authorization check failed');
      } finally {
        setLoading(false);
      }
    };
    fetchPrivileges();
  }, []);

  if (loading) return <LinearProgress loading={true} />;

  if (!authorized) {
    return <Box sx={{ p: 4 }}>You are not authorized to view this page. Please contact to Admin to grant you privileges.</Box>;
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
        <MenuManager />
      </Paper>
    </Box>
  );
};

export default MenuManagerPage;
