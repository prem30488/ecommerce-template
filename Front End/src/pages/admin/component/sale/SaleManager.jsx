import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Grid,
} from '@mui/material';
import Alert from 'react-s-alert';
import { getAllSales, createSale, updateSale, getCategories, getSaleAnalytics, getSaleImages, uploadSaleImage } from '../../../../util/APIUtils';

const initialFormState = {
    name: '',
    description: '',
    bannerImage: '',
    startDate: '',
    endDate: '',
    category: '',
    audience: [],
    discountType: 'PERCENTAGE',
    discountValue: 0,
    active: true,
};

const audienceOptions = ['Women', 'Men', 'Kids', 'Unisex'];

const SaleManager = () => {
    const [sales, setSales] = useState([]);
    const [categories, setCategories] = useState([]);
    const [bannerFiles, setBannerFiles] = useState([]);
    const [bannerPreviews, setBannerPreviews] = useState([]);
    const [analyticsOpen, setAnalyticsOpen] = useState(false);

    const createPreviewItems = (bannerImage, saleId) => {
        if (!bannerImage) return [];

        const toUrl = (name) => {
            if (!name) return '';
            const trimmed = name.trim();
            if (/^(https?:)?\/\//i.test(trimmed)) {
                return trimmed.replace(/\s/g, '%20');
            }
            const filename = trimmed.split('/').pop();
            const encodedFilename = encodeURIComponent(filename);
            return saleId
                ? `/images/sales/${saleId}/${encodedFilename}`
                : `/images/sales/${encodedFilename}`;
        };

        return bannerImage
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((name) => ({
                name,
                preview: toUrl(name),
            }));
    };

    const buildPreviewItemsFromUrls = (urls) => {
        return urls.map((url) => ({
            name: decodeURIComponent(url.split('/').pop() || ''),
            preview: url,
        }));
    };

    const loadSaleImagePreviews = async (saleId, bannerImage) => {
        try {
            const response = await getSaleImages(saleId);
            const imageUrls = response.data || [];
            if (Array.isArray(imageUrls) && imageUrls.length > 0) {
                setBannerPreviews(buildPreviewItemsFromUrls(imageUrls));
                return;
            }
        } catch (error) {
            console.warn('Unable to load sale folder images:', error);
        }

        setBannerPreviews(createPreviewItems(bannerImage, saleId));
    };

    const uploadSaleFiles = async (saleId) => {
        const uploadedNames = [];
        for (const file of bannerFiles) {
            const fileRequest = new FormData();
            fileRequest.append('file', file);
            const response = await uploadSaleImage(saleId, fileRequest);
            const filename = response.data?.filename || response.filename || response.data?.url?.split('/').pop();
            if (filename) uploadedNames.push(filename);
        }
        return uploadedNames;
    };

    const revokePreviewUrl = (previewUrl) => {
        if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
    };
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [formValues, setFormValues] = useState(initialFormState);

    const loadSales = async () => {
        setLoading(true);
        try {
            const response = await getAllSales();
            setSales(response.data || []);
        } catch (error) {
            Alert.error((error && error.message) || 'Unable to load sale data.');
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await getCategories(0, 100);
            setCategories(response.content || []);
        } catch (error) {
            console.warn('Unable to load categories for sale manager.', error);
        }
    };

    useEffect(() => {
        loadSales();
        loadCategories();
        return () => {
            bannerPreviews.forEach((item) => URL.revokeObjectURL(item.preview));
        };
    }, []);

    const handleOpenCreate = () => {
        setEditMode(false);
        setSelectedSaleId(null);
        setBannerFiles([]);
        setBannerPreviews([]);
        setFormValues(initialFormState);
        setOpenDialog(true);
    };

    const handleOpenEdit = async (sale) => {
        setEditMode(true);
        setSelectedSaleId(sale.id);
        setBannerFiles([]);
        setFormValues({
            name: sale.name || '',
            description: sale.description || '',
            bannerImage: sale.bannerImage || '',
            startDate: sale.startDate ? new Date(sale.startDate).toISOString().slice(0, 16) : '',
            endDate: sale.endDate ? new Date(sale.endDate).toISOString().slice(0, 16) : '',
            category: sale.category || '',
            audience: sale.audience ? sale.audience.split(',').map((item) => item.trim()) : [],
            discountType: sale.discountType || 'PERCENTAGE',
            discountValue: sale.discountValue || 0,
            active: sale.active,
        });
        await loadSaleImagePreviews(sale.id, sale.bannerImage || '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        bannerPreviews.forEach((item) => revokePreviewUrl(item.preview));
        setOpenDialog(false);
    };

    const handleChange = (field) => (event) => {
        const value = field === 'active' ? event.target.checked : event.target.value;
        setFormValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleBannerFilesChange = (event) => {
        const files = Array.from(event.target.files || []);
        const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        bannerPreviews.forEach((item) => revokePreviewUrl(item.preview));
        setBannerFiles(files);
        setBannerPreviews(previews);
    };

    const removeBannerFile = (index) => () => {
        const newFiles = [...bannerFiles];
        const newPreviews = [...bannerPreviews];
        revokePreviewUrl(newPreviews[index].preview);
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setBannerFiles(newFiles);
        setBannerPreviews(newPreviews);
        setFormValues((prev) => ({
            ...prev,
            bannerImage: newPreviews
                .map((item) => item.file?.name || item.name)
                .filter(Boolean)
                .join(', '),
        }));
    };

    const handleSave = async () => {
        const payload = {
            name: formValues.name,
            description: formValues.description,
            bannerImage: formValues.bannerImage,
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            category: formValues.category,
            audience: Array.isArray(formValues.audience) ? formValues.audience.join(', ') : formValues.audience,
            discountType: formValues.discountType,
            discountValue: formValues.discountValue,
            active: formValues.active,
        };

        try {
            let saleResponse;
            if (editMode && selectedSaleId) {
                saleResponse = await updateSale(selectedSaleId, payload);
            } else {
                saleResponse = await createSale({ ...payload, bannerImage: '' });
            }

            const saleId = saleResponse.data?.id || selectedSaleId;

            if (bannerFiles.length > 0 && saleId) {
                const uploadedNames = await uploadSaleFiles(saleId);
                const existingNames = editMode && formValues.bannerImage
                    ? formValues.bannerImage.split(',').map((item) => item.trim()).filter(Boolean)
                    : [];
                const mergedNames = [...existingNames, ...uploadedNames].filter(Boolean);
                const uniqueNames = Array.from(new Set(mergedNames));
                if (uniqueNames.length > 0) {
                    await updateSale(saleId, { bannerImage: uniqueNames.join(', ') });
                }
            }

            Alert.success(editMode ? 'Sale updated successfully.' : 'Sale created successfully.');
            handleCloseDialog();
            loadSales();
        } catch (error) {
            Alert.error((error && error.message) || 'Unable to save sale.');
        }
    };

    const handleViewAnalytics = async (saleId) => {
        try {
            const response = await getSaleAnalytics(saleId);
            setAnalyticsData(response.data || null);
            setAnalyticsOpen(true);
        } catch (error) {
            Alert.error((error && error.message) || 'Unable to fetch sale analytics.');
        }
    };

    const handleCloseAnalytics = () => {
        setAnalyticsOpen(false);
        setAnalyticsData(null);
    };

    return (
        <div>
            <Typography variant="h6" gutterBottom>
                Sale Manager
            </Typography>
            <Button variant="contained" color="primary" style={{ marginBottom: 16 }} onClick={handleOpenCreate}>
                {editMode ? 'Edit Sale' : 'Create New Sale'}
            </Button>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Views</TableCell>
                            <TableCell>Clicks</TableCell>
                            <TableCell>Conversions</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    {loading ? 'Loading sales...' : 'No active sales found.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{sale.id}</TableCell>
                                    <TableCell>{sale.name}</TableCell>
                                    <TableCell>{sale.active ? 'Yes' : 'No'}</TableCell>
                                    <TableCell>{new Date(sale.startDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{new Date(sale.endDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{sale.analyticsData?.views ?? 0}</TableCell>
                                    <TableCell>{sale.analyticsData?.clicks ?? 0}</TableCell>
                                    <TableCell>{sale.analyticsData?.conversions ?? 0}</TableCell>
                                    <TableCell>
                                        <Button variant="outlined" size="small" onClick={() => handleOpenEdit(sale)}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => handleViewAnalytics(sale.id)}
                                            style={{ marginLeft: 8 }}
                                        >
                                            Analytics
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>{editMode ? 'Edit Sale' : 'Create Sale'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Sale Name"
                                value={formValues.name}
                                onChange={handleChange('name')}
                                fullWidth
                                margin="dense"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select
                                    labelId="category-label"
                                    value={formValues.category}
                                    label="Category"
                                    onChange={handleChange('category')}
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.title}>
                                            {cat.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Start Date & Time"
                                type="datetime-local"
                                value={formValues.startDate}
                                onChange={handleChange('startDate')}
                                fullWidth
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="End Date & Time"
                                type="datetime-local"
                                value={formValues.endDate}
                                onChange={handleChange('endDate')}
                                fullWidth
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel id="discount-type-label">Discount Type</InputLabel>
                                <Select
                                    labelId="discount-type-label"
                                    value={formValues.discountType}
                                    label="Discount Type"
                                    onChange={handleChange('discountType')}
                                >
                                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                                    <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                                    <MenuItem value="BOGO">BOGO</MenuItem>
                                    <MenuItem value="VOLUME">Volume</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Discount Value"
                                type="number"
                                value={formValues.discountValue}
                                onChange={handleChange('discountValue')}
                                fullWidth
                                margin="dense"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel id="audience-label">Audience</InputLabel>
                                <Select
                                    labelId="audience-label"
                                    multiple
                                    value={formValues.audience}
                                    label="Audience"
                                    onChange={handleChange('audience')}
                                    renderValue={(selected) => selected.join(', ')}
                                >
                                    {audienceOptions.map((aud) => (
                                        <MenuItem key={aud} value={aud}>
                                            <Checkbox checked={formValues.audience.includes(aud)} />
                                            {aud}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="outlined" component="label" fullWidth>
                                Upload Banner Images
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    multiple
                                    onChange={handleBannerFilesChange}
                                />
                            </Button>
                        </Grid>
                        {bannerPreviews.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="subtitle2">Banner Preview</Typography>
                                <Grid container spacing={1}>
                                    {bannerPreviews.map((item, index) => (
                                        <Grid item key={index}>
                                            <Paper
                                                variant="outlined"
                                                style={{ width: 120, height: 120, position: 'relative' }}
                                            >
                                                <img
                                                    src={item.preview}
                                                    alt={item.file?.name || item.name || 'Banner preview'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <Button
                                                    size="small"
                                                    onClick={removeBannerFile(index)}
                                                    style={{ position: 'absolute', top: 0, right: 0, minWidth: 0 }}
                                                >
                                                    ×
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={formValues.description}
                                onChange={handleChange('description')}
                                fullWidth
                                multiline
                                rows={3}
                                margin="dense"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox checked={formValues.active} onChange={handleChange('active')} />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={analyticsOpen} onClose={handleCloseAnalytics} fullWidth maxWidth="sm">
                <DialogTitle>Sale Analytics</DialogTitle>
                <DialogContent>
                    {analyticsData ? (
                        <div>
                            <p><strong>Sale:</strong> {analyticsData.saleName}</p>
                            <p><strong>Views:</strong> {analyticsData.analytics?.views ?? 0}</p>
                            <p><strong>Clicks:</strong> {analyticsData.analytics?.clicks ?? 0}</p>
                            <p><strong>Conversions:</strong> {analyticsData.analytics?.conversions ?? 0}</p>
                        </div>
                    ) : (
                        <p>Loading analytics...</p>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAnalytics}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SaleManager;
