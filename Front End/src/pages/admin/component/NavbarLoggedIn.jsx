import { AppBar, Toolbar, Typography, Container, Paper, List, ListItem, ListItemButton, ListItemText, Drawer, Divider, Card } from '@mui/material';
import { Menu, Home, ShoppingCart, Assignment, People, Lock, GifTwoTone, Category } from '@mui/icons-material';
import { FaBlog, FaFileContract, FaGoodreads } from 'react-icons/fa';
import React , { useState , useEffect} from 'react';
import { ACCESS_TOKEN } from '../../../constants';
import Alert from 'react-s-alert';
import { useNavigate } from "react-router-dom";
import {getCurrentUser,getPrivileges} from '../../../util/APIUtils';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';
const NavbarLoggedIn = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [privileges, setPrivileges] = useState({});  
  const [open, setOpen] = React.useState();
  const [authenticated,setAuthenticated] = useState(false);
  const [currentUser,setCurrentUser] = useState();
  const navigate = useNavigate();
  const toggleDrawer = (isOpen) => {
    setOpen(isOpen);
  };
  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    navigate("/SignIn");
    window.location.reload();
    Alert.success("You're safely logged out!");
  }
  useEffect(() => {
    const getPrivilegesUser = async () => {

       await getCurrentUser()
      .then(response => {
        setCurrentUser(response);
        //console.log(JSON.stringify(currentUser));
        // Fetch user privileges from the backend when the component mounts
        if(currentUser && currentUser.id){
        getPrivileges(currentUser.id)
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
         // console.error('Error fetching user privileges:', error);
         // Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });  
      }
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
      
    };
    getPrivilegesUser();
  }, []);
 
    return (
        <>
        <AppBar position="static">
        <Toolbar>
          <Menu onClick={() => toggleDrawer(true)} />
          <Typography variant="h6">Hanley Healthcare E-commerce Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => toggleDrawer(false)}>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/dashboard")}>
              <Home />
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          {currentUser && currentUser.roles.map((role) => {
            return role.name === "ROLE_SUPERADMIN"?
            <ListItem key={role.name} disablePadding>
              <ListItemButton onClick={()=> navigate("/userManagement")}>
                <People/>
                <ListItemText primary="Users" />
              </ListItemButton>
            </ListItem>
          :""
          })
          }
          
          {privileges && privileges.categories===true || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"?
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/categoryManagement")}>
              <Category />
              <ListItemText primary="Categories" />
            </ListItemButton>
          </ListItem>
          :""}

          {privileges && privileges.forms===true  || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"?
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/formManagement")}>
              <Category />
              <ListItemText primary="Forms" />
            </ListItemButton>
          </ListItem>
          :""}

          {privileges && privileges.products===true  || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"?
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/productManagement")}>
              <ShoppingCart />
              <ListItemText primary="Products" />
            </ListItemButton>
          </ListItem>
          :""}

          {privileges && privileges.orders===true  || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"? 
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/orderManagement")}>
              <Assignment />
              <ListItemText primary="Orders" />
            </ListItemButton>
          </ListItem>
          :""}

          {privileges && privileges.coupons===true  || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"?
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/couponManagement")}>
              <GifTwoTone/>
              <ListItemText primary="Coupons" />
            </ListItemButton>
          </ListItem>
          :""}

          {privileges && privileges.testimonials===true  || currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN"?
          <ListItem disablePadding>
            <ListItemButton onClick={()=> navigate("/testimonialManagement")}>
              <FaGoodreads />
              <ListItemText primary="Testimonials" />
            </ListItemButton>
          </ListItem>
          :""}
          {/* <ListItem button>
            <FaBlog />
            <ListItemText primary="Blogs" />
          </ListItem> */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <Lock />
              <ListItemText primary="SignOut" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
        </>
    );
}

export default NavbarLoggedIn;
