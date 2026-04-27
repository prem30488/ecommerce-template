import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, IconButton, Box, Chip, Tooltip, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Check, Close, Delete, Search, Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import Alert from 'react-s-alert';
import { API_BASE_URL } from '../../../../constants';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import LinearProgress from '../../../../common/LinearProgress';

const ReviewManager = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [privileges, setPrivileges] = useState({});
    const [authLoading, setAuthLoading] = useState(true);

    const fetchReviews = async (page = 0, search = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const params = {
                page,
                size: rowsPerPage,
                search: search.trim()
            };
            const response = await axios.get(`${API_BASE_URL}/api/review/admin`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            const data = response.data.content || [];
            setReviews(Array.isArray(data) ? data : []);
            setTotalCount(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Alert.error('Failed to load reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

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
                setAuthLoading(false);
            }
        };
        fetchAuth();
        fetchReviews(0, searchQuery);
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(0);
        fetchReviews(0, query);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
        fetchReviews(0, '');
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        fetchReviews(newPage, searchQuery);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`${API_BASE_URL}/api/review/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.success(`Review ${status} successfully`);
            fetchReviews(currentPage, searchQuery);
        } catch (error) {
            Alert.error('Failed to update review status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`${API_BASE_URL}/api/review/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.success('Review deleted successfully');
            fetchReviews(currentPage, searchQuery);
        } catch (error) {
            Alert.error('Failed to delete review');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'product',
            headerName: 'Product',
            width: 200,
            renderCell: (params) => params.row.product?.title || 'Unknown'
        },
        { field: 'name', headerName: 'Customer', width: 150 },
        { field: 'email', headerName: 'Email', width: 180 },
        {
            field: 'rating', headerName: 'Rating', width: 100, renderCell: (params) => (
                <Box sx={{ fontWeight: 'bold', color: '#f59e0b' }}>{params.value} ★</Box>
            )
        },
        { field: 'comment', headerName: 'Comment', width: 250 },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => {
                const colors = { approved: 'success', pending: 'warning', rejected: 'error' };
                return <Chip label={params.value.toUpperCase()} color={colors[params.value]} size="small" />;
            }
        },
        {
            field: 'approver',
            headerName: 'Decided By',
            width: 140,
            renderCell: (params) => params.row.approver?.username || '-'
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                    {params.row.status !== 'approved' && (
                        <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleUpdateStatus(params.row.id, 'approved')}>
                                <Check />
                            </IconButton>
                        </Tooltip>
                    )}
                    {params.row.status !== 'rejected' && (
                        <Tooltip title="Reject">
                            <IconButton size="small" color="warning" onClick={() => handleUpdateStatus(params.row.id, 'rejected')}>
                                <Close />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    if (authLoading) return <Box sx={{ p: 10, textAlign: 'center' }}>Loading access control...</Box>;

    if (!(currentUser?.roles[0].name === "ROLE_SUPERADMIN" || privileges?.reviews)) {
        return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>
                        Access Restricted
                    </Typography>
                    <Typography color="textSecondary">
                        You do not have permission to manage reviews. Please contact an administrator to grant you access.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <LinearProgress loading={loading || authLoading} />
            <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
                    <Typography variant="h5" fontWeight={400} letterSpacing="-0.02em" color="#0f172a">
                        Review Management
                    </Typography>
                </Box>

                <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by customer name, email, or comment..."
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleClearSearch}
                        startIcon={<ClearIcon />}
                    >
                        Clear
                    </Button>
                </Box>

                <div style={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={reviews}
                        columns={columns}
                        loading={loading}
                        rowCount={totalCount}
                        paginationMode="server"
                        onPaginationModelChange={(newModel) => {
                            handleChangePage(null, newModel.page);
                            if (newModel.pageSize !== rowsPerPage) {
                                setRowsPerPage(newModel.pageSize);
                                fetchReviews(0, searchQuery);
                            }
                        }}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: rowsPerPage, page: currentPage },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25, 50]}
                        disableSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: '#f8fafc',
                                color: '#64748b',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #f1f5f9'
                            },
                            '& .MuiDataGrid-cell': {
                                py: 2,
                                color: '#334155',
                                fontSize: '0.875rem',
                                borderBottom: '1px solid #f1f5f9'
                            },
                            '& .MuiDataGrid-root': {
                                borderRadius: 12,
                                overflow: 'hidden'
                            }
                        }}
                    />
                </div>
            </Paper>
        </Container>
    );
};

export default ReviewManager;
