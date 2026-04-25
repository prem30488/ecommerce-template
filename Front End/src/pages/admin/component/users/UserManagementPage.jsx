import React, { useState, useEffect } from 'react';
import UserManagement from './UserManagement';
import { Paper, Typography, Box } from '@mui/material';
import { getCurrentUser } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

function UserManagementPage() {
  const [currentUser, setCurrentUser] = useState();

  useEffect(() => {
    const getPrivileges = async () => {
      try {
        const response = await getCurrentUser();
        setCurrentUser(response);
      } catch (error) {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      }
    };
    getPrivileges();
  }, []);

  if (currentUser && currentUser.roles[0].name === 'ROLE_SUPERADMIN') {

  } else if (currentUser) {
    return "You are not authorized to view this page. Please contact to Admin to grant you privileges.";
  } else {
    return null;
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
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary', 
            mb: 4,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          User Management
        </Typography>
        <UserManagement />
      </Paper>
    </Box>
  );
}

export default UserManagementPage;
