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

    const isAuthorized = (currentUser && (
        currentUser.role === 'superadmin' || 
        (currentUser.roles && currentUser.roles[0].name === 'ROLE_SUPERADMIN') ||
        privileges.sliders === true
    ));

    if (!isAuthorized) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 6, boxShadow: 3, border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 'bold', mb: 2 }}>
                        Access Restricted
                    </Typography>
                    <Typography sx={{ color: '#64748b' }}>
                        You do not have permission to view this page. Please contact an admin to grant you privileges.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container>
            <CssBaseline />
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>

                <SliderManager />
            </Paper>
        </Container>
    );
};

export default SliderManagementPage;
