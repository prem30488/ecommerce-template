import React,{useState,useEffect} from 'react';
import UserManagement from './UserManagement';
import { Container, CssBaseline, Paper, Typography } from '@mui/material';
import {getCurrentUser} from '../../../../util/APIUtils';
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';
function UserManagementPage() {
  const [privileges, setPrivileges] = useState({});  
  const [currentUser,setCurrentUser] = useState();

  useEffect(() => {
    const getPrivileges = async () => {

       await getCurrentUser()
      .then(response => {
        setCurrentUser(response);
        console.log(JSON.stringify(currentUser));
        // Fetch user privileges from the backend when the component mounts
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });  
    };
    getPrivileges();
  }, []);

  if(currentUser && currentUser.roles[0].name === 'ROLE_SUPERADMIN'){

  }else{
    return "You are not authorized to view this page. Please contact to Admin to grant you privileges.";
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <CssBaseline />
      <Paper elevation={3} style={{ padding: '20px', margin: '20px 0' }}>
        <Typography variant="h5" align="center">User Management</Typography>
        <br/><br/>
        <UserManagement />
      </Paper>
      
    </Container>
  );
}

export default UserManagementPage;
