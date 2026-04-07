import { AppBar, Toolbar, Typography, Container, Paper, List, ListItem, ListItemButton, ListItemText, Drawer, Divider, Card } from '@mui/material';
import { Menu, Home, ShoppingCart, Assignment, People, Lock, GifTwoTone, Category, ViewCarousel, MonetizationOn } from '@mui/icons-material';
import { FaBlog, FaFileContract, FaGoodreads } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { ACCESS_TOKEN } from '../../../constants';
import Alert from 'react-s-alert';
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getPrivileges } from '../../../util/APIUtils';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';
const NavbarLoggedIn = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [privileges, setPrivileges] = useState({});
  const [open, setOpen] = React.useState();
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState();
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
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);

        // Superadmins don't need to fetch privileges as they have implicit full access
        if (user && user.id && user.roles && user.roles[0].name !== "ROLE_SUPERADMIN") {
          const privsResponse = await getPrivileges(user.id);
          const data = privsResponse.data || privsResponse;
          
          setPrivileges({
            id: data.id,
            userId: data.id,
            categories: !!data.categories,
            forms: !!data.forms,
            products: !!data.products,
            orders: !!data.orders,
            coupons: !!data.coupons,
            testimonials: !!data.testimonials,
            flavors: !!data.flavors,
            faqs: !!data.faqs,
            reviews: !!data.reviews,
            sales: !!data.sales,
            sliders: !!data.sliders,
            leadership: !!data.leadership,
            deleteFlag: !!data.deleteFlag
          });
        }
      } catch (error) {
        console.error('Error fetching auth/privileges:', error);
      }
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
          {/* Dashboard/Home always first */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate("/dashboard")}>
              <Home />
              <ListItemText primary="Home" sx={{ ml: 1.5 }} />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* Sorted Management Items */}
          {[
            { label: "Categories", path: "/categoryManagement", icon: <Category />, show: privileges.categories || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Coupons", path: "/couponManagement", icon: <GifTwoTone />, show: privileges.coupons || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "FAQs", path: "/faqManagement", icon: <Category />, show: privileges.faqs || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Flavors", path: "/flavorManagement", icon: <Category />, show: privileges.flavors || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Forms", path: "/formManagement", icon: <Category />, show: privileges.forms || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Leadership", path: "/leadershipManagement", icon: <People />, show: privileges.leadership || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Orders", path: "/orderManagement", icon: <Assignment />, show: privileges.orders || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Products", path: "/productManagement", icon: <ShoppingCart />, show: privileges.products || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Reviews", path: "/reviewManagement", icon: <FaGoodreads />, show: privileges.reviews || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Sales", path: "/saleManagement", icon: <MonetizationOn />, show: privileges.sales || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Sliders", path: "/sliderManagement", icon: <ViewCarousel />, show: privileges.sliders || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Testimonials", path: "/testimonialManagement", icon: <FaGoodreads />, show: privileges.testimonials || (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
            { label: "Users", path: "/userManagement", icon: <People />, show: (currentUser && currentUser.roles[0].name === "ROLE_SUPERADMIN") },
          ]
            .filter(item => item.show)
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  {item.icon}
                  <ListItemText primary={item.label} sx={{ ml: 1.5 }} />
                </ListItemButton>
              </ListItem>
            ))}

          <Divider sx={{ my: 1 }} />

          {/* Logout always bottom */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <Lock />
              <ListItemText primary="SignOut" sx={{ ml: 1.5 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default NavbarLoggedIn;
