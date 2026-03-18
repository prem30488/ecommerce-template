// src/components/CategoryManagement.js
import React,{useState,useEffect} from 'react';
import { Paper, Typography } from '@mui/material';
import CategoryManagement from './CategoryManagement';
import { CssBaseline, Container } from '@mui/material';
import CategoryManager from './CategoryManager';
import {getCurrentUser} from '../../../../util/APIUtils';
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';
const CategoryManagementPage = () => {
  const [privileges, setPrivileges] = useState({});  
  const [currentUser,setCurrentUser] = useState();
  useEffect(() => {
    const getPrivileges = async () => {

       await getCurrentUser()
      .then(response => {
        setCurrentUser(response);
        console.log(JSON.stringify(currentUser));
        // Fetch user privileges from the backend when the component mounts
      axios.get(API_BASE_URL+`/api/user/privileges/${currentUser.id}`)
      .then(response => {
        //console.log("privileges :"+ JSON.stringify(response.data));
        setPrivileges({id:response.data.id,userId:response.data.id,
          categories:response.data.categories, forms : response.data.forms, 
          products: response.data.products, orders: response.data.orders,
          coupons : response.data.coupons, testimonials : response.data.testimonials,
          deleteFlag : response.data.deleteFlag
          })
      })
      .catch(error => {
        console.error('Error fetching user privileges:', error);
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });  
    };
    getPrivileges();
  }, [currentUser,privileges]);

  if(privileges && privileges.categories === true || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"){

  }else{
    return "You are not authorized to view this page. Please contact to Admin to grant you privileges.";
  }

  return (
    <Container>
    <CssBaseline />
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" align="center">Category Management</Typography>
      {/* Category management content */}
      <CategoryManager/>
    </Paper>
    </Container>
  );
};

export default CategoryManagementPage;
