import React, { useState, useEffect } from 'react';
import { Paper, Typography, CssBaseline, Container } from '@mui/material';
import SliderManager from './SliderManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const SliderManagementPage = () => {
    const [privileges, setPrivileges] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);

                // For simplicity, using testimonials privilege for sliders or superadmin
                // Ideally, a new 'sliders' privilege should be added to the Privilege model
                const privilegesData = await getPrivileges(user.id);
                setPrivileges(privilegesData);
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    if (loading) return <div>Loading...</div>;

    // Check if user is superadmin or has relevant privileges (using testimonials as a proxy if sliders not available)
    const isAuthorized = currentUser && (
        currentUser.role === 'superadmin' || 
        (currentUser.roles && currentUser.roles[0].name === 'ROLE_SUPERADMIN') ||
        privileges.testimonials === true
    );

    if (!isAuthorized) {
        return (
            <Container>
                <Typography variant="h6" color="error" align="center" style={{ marginTop: '50px' }}>
                    You are not authorized to view this page. Please contact an admin to grant you privileges.
                </Typography>
            </Container>
        );
    }

    return (
        <Container>
            <CssBaseline />
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
                <Typography variant="h5" align="center" gutterBottom>
                    Slider Management
                </Typography>
                <SliderManager />
            </Paper>
        </Container>
    );
};

export default SliderManagementPage;
