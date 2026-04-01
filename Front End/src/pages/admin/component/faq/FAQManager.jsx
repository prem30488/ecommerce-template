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
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';

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
        fetchFAQs(0, searchQuery);
        fetchProducts();
    }, []);

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

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">FAQ Management</h2>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                    className="bg-sky-600 hover:bg-sky-700"
                >
                    Add New FAQ
                </Button>
            </div>

            {/* Search Bar */}
            <Box className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex gap-2">
                    <TextField
                        fullWidth
                        placeholder="Search FAQs by question or asked by..."
                        value={searchQuery}
                        onChange={handleSearch}
                        size="small"
                        variant="outlined"
                        startAdornment={<SearchIcon className="mr-2 text-slate-400" />}
                    />
                    {searchQuery && (
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearSearch}
                            className="whitespace-nowrap"
                        >
                            Clear
                        </Button>
                    )}
                </div>
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
                <DialogTitle className="font-bold border-b border-slate-100 pb-4 bg-slate-50">
                    View FAQ
                </DialogTitle>
                <DialogContent className="pt-6">
                    {viewFAQ && (
                        <div className="space-y-4">
                            <div>
                                <Typography className="font-bold text-slate-600 mb-2">Question</Typography>
                                <Typography className="text-slate-700 whitespace-pre-wrap">{viewFAQ.question}</Typography>
                            </div>
                            <div>
                                <Typography className="font-bold text-slate-600 mb-2">Answer</Typography>
                                <Typography className="text-slate-700 whitespace-pre-wrap">{viewFAQ.answer}</Typography>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Typography className="font-bold text-slate-600 mb-1">Asked By</Typography>
                                    <Typography className="text-slate-700">{viewFAQ.askedBy || 'N/A'}</Typography>
                                </div>
                                <div>
                                    <Typography className="font-bold text-slate-600 mb-1">Status</Typography>
                                    <Chip
                                        label={viewFAQ.isActive ? 'Active' : 'Inactive'}
                                        color={viewFAQ.isActive ? 'success' : 'default'}
                                        size="small"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
                <DialogActions className="p-4 border-t border-slate-100 bg-slate-50">
                    <Button onClick={handleViewClose} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit FAQ Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle className="font-bold border-b border-slate-100 pb-4 bg-slate-50">
                    {isEditing ? 'Edit FAQ' : 'Add New FAQ'}
                </DialogTitle>
                <DialogContent className="pt-6">
                    <FormControl fullWidth variant="outlined" margin="dense" className="mb-4">
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
                        className="mb-4"
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
                        className="mb-4"
                    />
                    <TextField
                        margin="dense"
                        label="Asked By"
                        fullWidth
                        variant="outlined"
                        value={currentFAQ.askedBy}
                        onChange={(e) => setCurrentFAQ({ ...currentFAQ, askedBy: e.target.value })}
                        className="mb-4"
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
                <DialogActions className="p-4 border-t border-slate-100 bg-slate-50">
                    <Button onClick={handleClose} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} color="primary" variant="contained" disabled={!currentFAQ.question.trim()}>
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default FAQManager;
