import React, { useState, useEffect } from 'react';
import { Paper, Typography, CssBaseline, Container } from '@mui/material';
import SaleManager from './SaleManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const SaleManagementPage = () => {
    const [privileges, setPrivileges] = useState({});
    const [currentUser, setCurrentUser] = useState();

    useEffect(() => {
        const fetchPrivileges = async () => {
            try {
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
                    deleteFlag: privilegesData.deleteFlag,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            }
        };
        fetchPrivileges();
    }, []);

    if (privileges && privileges.products === true || currentUser && currentUser.roles[0].name === 'ROLE_SUPERADMIN') {
    } else {
        return 'You are not authorized to view this page. Please contact Admin to grant you privileges.';
    }

    return (
        <Container>
            <CssBaseline />
            <Paper elevation={3} style={{ padding: '20px' }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Sale Management
                </Typography>
                <SaleManager />
            </Paper>
        </Container>
    );
};

export default SaleManagementPage;
