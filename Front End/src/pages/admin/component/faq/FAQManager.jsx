import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Typography,
    Chip,
    Switch,
    FormControlLabel,
    TablePagination,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Visibility as ViewIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';
import { getCurrentUser, getPrivileges } from '../../../../util/APIUtils';
import axios from 'axios';
import LinearProgress from '../../../../common/LinearProgress';
const FAQManager = () => {
    const [faqs, setFaqs] = useState([]);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [currentFAQ, setCurrentFAQ] = useState({ question: '', answer: 'COMING SOON', askedBy: '', isActive: true, productId: '' });
    const [viewFAQ, setViewFAQ] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [privileges, setPrivileges] = useState({});
    const [authLoading, setAuthLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_BASE_URL}/api/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchFAQs = async (p = 0, search = '') => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const params = {
                page: p,
                size: rowsPerPage,
                search: search.trim()
            };
            const response = await axios.get(`${API_BASE_URL}/api/faq`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setFaqs(response.data.content || []);
            setTotalCount(response.data.totalElements || 0);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            Alert.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);

                if (user && user.roles && user.roles[0].name === "ROLE_SUPERADMIN") {
                    setAuthLoading(false);
                    return;
                }

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
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchFAQs(0, searchQuery);
    }, [searchQuery]);

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setPage(0);
        fetchFAQs(0, query);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setPage(0);
        fetchFAQs(0, '');
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchFAQs(newPage, searchQuery);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        fetchFAQs(0, searchQuery);
    };

    const handleOpen = (faq = { question: '', answer: 'COMING SOON', askedBy: '', isActive: true, productId: '' }) => {
        setCurrentFAQ(faq);
        setIsEditing(!!faq.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentFAQ({ question: '', answer: 'COMING SOON', askedBy: '', isActive: true, productId: '' });
    };

    const handleViewOpen = (faq) => {
        setViewFAQ(faq);
        setViewOpen(true);
    };

    const handleViewClose = () => {
        setViewOpen(false);
        setViewFAQ(null);
    };

    const handleSave = async () => {
        if (!currentFAQ.question.trim()) {
            Alert.error('Question is required');
            return;
        }
        if (!currentFAQ.productId) {
            Alert.error('Product is required');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (isEditing) {
                await axios.put(`${API_BASE_URL}/api/faq/${currentFAQ.id}`, currentFAQ, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Alert.success('FAQ updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/api/faq`, currentFAQ, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Alert.success('FAQ created successfully');
            }
            setPage(0);
            fetchFAQs(0, searchQuery);
            handleClose();
        } catch (error) {
            console.error('Error saving FAQ:', error);
            Alert.error('Failed to save FAQ');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`${API_BASE_URL}/api/faq/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Alert.success('FAQ deleted successfully');
                fetchFAQs(page, searchQuery);
            } catch (error) {
                console.error('Error deleting FAQ:', error);
                Alert.error('Failed to delete FAQ');
            }
        }
    };

    const handleToggleActive = async (faq) => {
        try {
            const token = localStorage.getItem('accessToken');
            const updatedFAQ = { ...faq, isActive: !faq.isActive };
            await axios.put(`${API_BASE_URL}/api/faq/${faq.id}`, updatedFAQ, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.success(updatedFAQ.isActive ? 'FAQ activated' : 'FAQ deactivated');
            fetchFAQs(page, searchQuery);
        } catch (error) {
            console.error('Error updating FAQ status:', error);
            Alert.error('Failed to update FAQ status');
        }
    };

    if (authLoading) return <Box sx={{ p: 10, textAlign: 'center' }}>Loading access control...</Box>;

    if (!(currentUser?.roles[0].name === "ROLE_SUPERADMIN" || privileges?.faqs)) {
        return (
            <Box sx={{ p: 10 }}>
                <Paper sx={{ p: 10, textAlign: 'center', borderRadius: 8, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 'bold', mb: 2 }}>
                        Access Restricted
                    </Typography>
                    <Typography sx={{ color: '#64748b' }}>
                        You do not have permission to manage FAQs. Please contact an administrator to grant you access.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <LinearProgress loading={loading || authLoading} />
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' }, 
                gap: 2,
                mb: 4 
            }}>
                <Typography variant="h5" sx={{ 
                    color: 'var(--color-text, #1e293b)', 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.25rem', md: '1.5rem' } 
                }}>
                    FAQ Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    sx={{ 
                        width: { xs: '100%', md: 'auto' },
                        py: 1,
                        px: 3,
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: '600'
                    }}
                >
                    Add New FAQ
                </Button>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 4, p: 2, bgcolor: 'var(--color-bg-paper, #f8fafc)', borderRadius: 4, border: '1px solid var(--color-divider, #f1f5f9)' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search FAQs by question or asked by..."
                        value={searchQuery}
                        onChange={handleSearch}
                        size="small"
                        variant="outlined"
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: '#94a3b8' }} />
                        }}
                    />
                    {searchQuery && (
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearSearch}
                            sx={{ 
                                whiteSpace: 'nowrap',
                                width: { xs: '100%', sm: 'auto' }
                            }}
                        >
                            Clear
                        </Button>
                    )}
                </Box>
            </Box>

            <TableContainer component={Paper} className="shadow-xl rounded-2xl border border-slate-100">
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-600" width="5%">ID</TableCell>
                            <TableCell className="font-bold text-slate-600" width="25%">Question</TableCell>
                            <TableCell className="font-bold text-slate-600" width="15%">Product</TableCell>
                            <TableCell className="font-bold text-slate-600" width="15%">Asked By</TableCell>
                            <TableCell className="font-bold text-slate-600" width="15%">Status</TableCell>
                            <TableCell className="font-bold text-slate-600 text-right" width="40%">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {faqs.map((faq) => (
                            <TableRow key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>{faq.id}</TableCell>
                                <TableCell className="font-medium text-slate-700 truncate">{faq.question}</TableCell>
                                <TableCell className="font-medium text-slate-700">{products.find(p => p.id === faq.productId)?.title || 'Unknown'}</TableCell>
                                <TableCell className="font-medium text-slate-700">{faq.askedBy || '-'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={faq.isActive ? 'Active' : 'Inactive'}
                                        color={faq.isActive ? 'success' : 'default'}
                                        size="small"
                                        variant={faq.isActive ? 'filled' : 'outlined'}
                                    />
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <IconButton
                                        onClick={() => handleViewOpen(faq)}
                                        color="info"
                                        size="small"
                                        title="View"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleOpen(faq)}
                                        color="primary"
                                        size="small"
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleToggleActive(faq)}
                                        color={faq.isActive ? 'warning' : 'success'}
                                        size="small"
                                        title={faq.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {faq.isActive ? '✓' : '+'}
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(faq.id)}
                                        color="error"
                                        size="small"
                                        title="Delete"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {faqs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                                    {loading ? 'Loading...' : 'No FAQs found. Create one to get started!'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>

            {/* View FAQ Dialog */}
            <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 2, bgcolor: '#f8fafc' }}>
                    View FAQ
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {viewFAQ && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', color: '#64748b', mb: 1 }}>Question</Typography>
                                <Typography sx={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{viewFAQ.question}</Typography>
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 'bold', color: '#64748b', mb: 1 }}>Answer</Typography>
                                <Typography sx={{ color: '#334155', whiteSpace: 'pre-wrap' }}>{viewFAQ.answer}</Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold', color: '#64748b', mb: 0.5 }}>Asked By</Typography>
                                    <Typography sx={{ color: '#334155' }}>{viewFAQ.askedBy || 'N/A'}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 'bold', color: '#64748b', mb: 0.5 }}>Status</Typography>
                                    <Chip
                                        label={viewFAQ.isActive ? 'Active' : 'Inactive'}
                                        color={viewFAQ.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                    <Button onClick={handleViewClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit FAQ Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 2, bgcolor: '#f8fafc' }}>
                    {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <FormControl fullWidth variant="outlined" margin="dense" sx={{ mb: 2 }}>
                        <InputLabel id="product-select-label">Product</InputLabel>
                        <Select
                            labelId="product-select-label"
                            value={currentFAQ.productId || ''}
                            onChange={(e) => setCurrentFAQ({ ...currentFAQ, productId: e.target.value })}
                            label="Product"
                        >
                            {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                    {product.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Question"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={3}
                        value={currentFAQ.question}
                        onChange={(e) => setCurrentFAQ({ ...currentFAQ, question: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Answer"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={currentFAQ.answer}
                        onChange={(e) => setCurrentFAQ({ ...currentFAQ, answer: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="Asked By"
                        fullWidth
                        variant="outlined"
                        value={currentFAQ.askedBy}
                        onChange={(e) => setCurrentFAQ({ ...currentFAQ, askedBy: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={currentFAQ.isActive}
                                onChange={(e) => setCurrentFAQ({ ...currentFAQ, isActive: e.target.checked })}
                            />
                        }
                        label="Active"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} color="primary" variant="contained" disabled={!currentFAQ.question.trim()}>
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FAQManager;
