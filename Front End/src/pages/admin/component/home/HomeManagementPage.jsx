import React, { useState, useEffect } from 'react';
import { Paper, Box } from '@mui/material';
import HomeManager from './HomeManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const HomeManagementPage = () => {
  const [privileges, setPrivileges] = useState({});
  const [currentUser, setCurrentUser] = useState();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        const privilegesData = await getPrivileges(user.id);
        setPrivileges(privilegesData);
        
        // Logic for authorization - superadmin or has categories privilege (using categories as a proxy for site-wide settings)
        if (user.roles[0].name === "ROLE_SUPERADMIN" || privilegesData.categories === true) {
          setAuthorized(true);
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

  if (loading) return null;

  if (!authorized) {
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
        <HomeManager />
      </Paper>
    </Box>
  );
};

export default HomeManagementPage;
