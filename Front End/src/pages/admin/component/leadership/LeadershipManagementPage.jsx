import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography } from '@mui/material';
import LeadershipManager from './LeadershipManager';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

const LeadershipManagementPage = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [privileges, setPrivileges] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);
                if (user && user.id) {
                    const privs = await getPrivileges(user.id);
                    setPrivileges(privs);
                }
            } catch (error) {
                console.error('Error fetching auth:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuth();
    }, []);

    if (loading) return null;

    if (!(currentUser?.roles[0].name === "ROLE_SUPERADMIN" || privileges?.leadership)) {
        return (
            <Container maxWidth="md" sx={{ mt: 10 }}>
                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>
                        Access Restricted
                    </Typography>
                    <Typography color="textSecondary">
                        You do not have permission to manage leadership. Please contact an administrator to grant you access.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 3 }}>
            <LeadershipManager />
        </Container>
    );
};

export default LeadershipManagementPage;
