import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Container,
    TextField,
    Button,
    Box,
    Divider,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Alert,
    CircularProgress
} from '@mui/material';
import { trackOrder } from '../util/APIUtils';
import dayjs from 'dayjs';
import { FaTruck, FaBox, FaCheckCircle, FaSearch, FaClock } from 'react-icons/fa';
import SEO from '../components/SEO';
import LinearProgress from '../common/LinearProgress';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        if (!orderId.trim()) return;

        setLoading(true);
        setError(null);
        setTrackingData(null);

        try {
            const response = await trackOrder(orderId);
            if (response.success) {
                setTrackingData(response.order);
            } else {
                setError(response.message || 'Order not found');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch tracking details. Please check your Order ID.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString, fallbackDate = null) => {
        const date = dateString || fallbackDate;
        if (!date) return null;
        try {
            return dayjs(date).format('MMMM D, YYYY h:mm A');
        } catch (e) {
            return date;
        }
    };

    const getSteps = () => {
        if (!trackingData) return [];

        const status = trackingData.status?.toLowerCase();

        const steps = [
            {
                label: 'Order Placed',
                date: trackingData.created_at || trackingData.createdAt,
                description: 'Your order has been successfully placed and is awaiting confirmation.',
                icon: <FaBox />,
                completed: true
            },
            {
                label: 'Processing',
                date: trackingData.processing_at || (status === 'processing' ? trackingData.updatedAt : null),
                description: 'We are preparing your items for shipping.',
                icon: <FaClock />,
                completed: !!trackingData.processing_at || status === 'processing' || status === 'shipped' || status === 'delivered'
            },
            {
                label: 'Shipped',
                date: trackingData.shipped_at || (status === 'shipped' ? trackingData.updatedAt : null),
                description: 'Your package is on its way to you.',
                icon: <FaTruck />,
                completed: !!trackingData.shipped_at || status === 'shipped' || status === 'delivered'
            }
        ];

        if (status === 'cancelled' || trackingData.cancelled_at) {
            steps.push({
                label: 'Cancelled',
                date: trackingData.cancelled_at || trackingData.updatedAt,
                description: 'This order was cancelled.',
                icon: <FaCheckCircle style={{ color: '#f44336' }} />,
                completed: true
            });
        } else {
            steps.push({
                label: 'Delivered',
                date: trackingData.delivered_at || (status === 'delivered' ? trackingData.updatedAt : null),
                description: 'Order has been delivered safely.',
                icon: <FaCheckCircle style={{ color: '#4caf50' }} />,
                completed: !!trackingData.delivered_at || status === 'delivered'
            });
        }

        return steps;
    };

    const steps = getSteps();
    const activeStep = steps.filter(s => s.completed).length - 1;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            paddingTop: '120px',
            paddingBottom: '50px',
            borderTop: '1px solid var(--color-primary-glow)'
        }}>
            <LinearProgress loading={loading} />
            <SEO
                title={`Track Your Order | ${COMPANY_INFO.name} | Premium Supplements & Healthcare`}
                description={`Easily track your order status in real-time.Enter your Order ID to see the current status and history.`}
                keywords={`${COMPANY_INFO.seoKeywords}`}
            />
            <Container maxWidth="md">
                <Paper elevation={6} sx={{ borderRadius: '15px', overflow: 'hidden', border: '1px solid var(--color-primary-border)' }}>
                    <Box sx={{ p: 4, bgcolor: 'var(--color-primary)', color: 'white', textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Track Your Order
                        </Typography>
                        <Typography variant="body1">
                            Enter your Order ID to see the current status and history.
                        </Typography>
                    </Box>

                    <Box sx={{ p: 4 }}>
                        <form onSubmit={handleTrack}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Enter Order ID (e.g. 101)"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '10px',
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'var(--color-primary)',
                                            }
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    type="submit"
                                    disabled={loading || !orderId.trim()}
                                    sx={{
                                        borderRadius: '10px',
                                        px: 4,
                                        bgcolor: 'var(--color-primary)',
                                        '&:hover': { bgcolor: 'var(--color-primary-hover)' }
                                    }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : <FaSearch />}
                                </Button>
                            </Box>
                        </form>

                        {error && (
                            <Alert severity="error" sx={{ mb: 4, borderRadius: '10px' }}>
                                {error}
                            </Alert>
                        )}

                        {trackingData && (
                            <Box>
                                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            Order #{trackingData.id}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Current Status: <span style={{
                                                fontWeight: 'bold',
                                                color: trackingData.status?.toLowerCase() === 'cancelled' ? '#f44336' : 'var(--color-primary)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {trackingData.status}
                                            </span>
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 4 }} />

                                <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 2 }}>
                                    {steps.map((step, index) => (
                                        <Step key={step.label} active={index <= activeStep}>
                                            <StepLabel
                                                StepIconComponent={() => (
                                                    <Box sx={{
                                                        color: index <= activeStep ? 'var(--color-primary)' : '#ccc',
                                                        fontSize: '20px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '40px'
                                                    }}>
                                                        {step.icon}
                                                    </Box>
                                                )}
                                            >
                                                <Typography variant="subtitle1" fontWeight={index === activeStep ? 'bold' : 'normal'}>
                                                    {step.label}
                                                </Typography>
                                            </StepLabel>
                                            <StepContent>
                                                <Typography variant="body2" color="text.secondary">
                                                    {step.description}
                                                </Typography>
                                                {step.date && (
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                                        {formatDate(step.date)}
                                                    </Typography>
                                                )}
                                            </StepContent>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        )}

                        {!trackingData && !loading && !error && (
                            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                                <FaTruck size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
                                <Typography variant="body1">
                                    Your order details will appear here once you search.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </div>
    );
};

export default TrackOrder;
