import React, { useState, useEffect } from 'react';
import { Paper, Typography, Container, CssBaseline } from '@mui/material';
import FlavorManager from './FlavorManager';
import { getCurrentUser } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const FlavorManagementPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        Alert.error('Authentication failed');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return null;

  if (currentUser?.roles[0].name !== "ROLE_SUPERADMIN") {
    return (
      <Container className="mt-10">
        <Paper className="p-10 text-center">
          <Typography variant="h6" color="error">
            You are not authorized to view this page. Please contact a Super Admin.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-10">
      <CssBaseline />
      <Paper elevation={0} className="p-6 bg-transparent">
        <FlavorManager />
      </Paper>
    </Container>
  );
};

export default FlavorManagementPage;
