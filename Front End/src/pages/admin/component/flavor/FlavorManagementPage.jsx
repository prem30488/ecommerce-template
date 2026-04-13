import React, { useState, useEffect } from 'react';
import { Paper, Typography, Container, CssBaseline } from '@mui/material';
import FlavorManager from './FlavorManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const FlavorManagementPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [privileges, setPrivileges] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user && user.id) {
          const privilegesData = await getPrivileges(user.id);
          setPrivileges(privilegesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.error('Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return null;

  if (!(currentUser?.roles[0].name === "ROLE_SUPERADMIN" || privileges?.flavors)) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 10, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            You are not authorized to view this page. Please contact to Admin to grant you privileges.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <CssBaseline />
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
        <FlavorManager />
      </Paper>
    </Container>
  );
};

export default FlavorManagementPage;
