import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Switch, FormControlLabel, Box, TextField, TablePagination, Typography } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SliderForm from './SliderForm';
import Alert from 'react-s-alert';
import { getSliders, addSlider, updateSlider, deleteSlider, undeleteSlider } from '../../../../util/APIUtils';

const SliderManager = () => {
    const [sliders, setSliders] = useState([]);
    const [selectedSlider, setSelectedSlider] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchSlidersList(0, searchQuery);
    }, []);

    const fetchSlidersList = async (page = 0, search = '') => {
        setLoading(true);
        try {
            const res = await getSliders(page, rowsPerPage, undefined, search);
            setSliders(res.content || []);
            setTotalCount(res.totalElements || 0);
        } catch (error) {
            console.error('Error fetching sliders:', error);
            Alert.error('Failed to load sliders');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setCurrentPage(0);
        fetchSlidersList(0, query);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
        fetchSlidersList(0, '');
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
        fetchSlidersList(newPage, searchQuery);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
        fetchSlidersList(0, searchQuery);
    };

    const handleAddSlider = () => {
        setSelectedSlider(null);
        setIsFormOpen(true);
    };

    const handleEditSlider = (slider) => {
        setSelectedSlider(slider);
        setIsFormOpen(true);
    };

    const handleDeleteSlider = async (id) => {
        try {
            await deleteSlider(id).then((res) => {
                Alert.success("Slider deleted successfully!");
                fetchSlidersList(currentPage, searchQuery);
            }).catch(error => {
                Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            });
        } catch (error) {
            console.error('Error deleting slider:', error);
        }
    };

    const handleUndeleteSlider = async (id) => {
        try {
            await undeleteSlider(id).then((res) => {
                Alert.success("Slider restored successfully!");
                fetchSlidersList(currentPage, searchQuery);
            }).catch(error => {
                Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            });
        } catch (error) {
            console.error('Error undeleting slider:', error);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedSlider) {
                await updateSlider(formData).then((res) => {
                    Alert.success("Slider updated successfully!");
                    fetchSlidersList(currentPage, searchQuery);
                    setIsFormOpen(false);
                }).catch(error => {
                    Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
                });
            } else {
                await addSlider(formData).then((res) => {
                    Alert.success("Slider added successfully!");
                    fetchSlidersList(currentPage, searchQuery);
                    setIsFormOpen(false);
                }).catch(error => {
                    Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
                });
            }
        } catch (error) {
            console.error('Error saving slider:', error);
        }
    };

    const handleToggleActive = async (slider, isActive) => {
        try {
            const updatedSlider = { ...slider, active: isActive };
            await updateSlider(updatedSlider).then((res) => {
                Alert.success(`Slide ${isActive ? 'activated' : 'deactivated'} successfully!`);
                fetchSlidersList(currentPage, searchQuery);
            }).catch(error => {
                Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            });
        } catch (error) {
            console.error('Error toggling slide active state:', error);
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'src',
            headerName: 'Image',
            width: 150,
            renderCell: (params) => (
                <img src={params.value} alt="slider" style={{ width: '100px', height: '60px', objectFit: 'cover' }} />
            )
        },
        { field: 'headline', headerName: 'Headline', width: 250 },
        { field: 'category', headerName: 'Category', width: 150 },
        {
            field: 'active',
            headerName: 'Active',
            width: 120,
            renderCell: (params) => (
                <FormControlLabel
                    control={
                        <Switch
                            checked={params.value}
                            onChange={(e) => handleToggleActive(params.row, e.target.checked)}
                        />
                    }
                    label={params.value ? 'Active' : 'Hidden'}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            renderCell: (params) => (
                <>
                    <IconButton color="primary" onClick={() => handleEditSlider(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDeleteSlider(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
                    {params.row.deleteFlag && (
                        <Button size="small" variant="outlined" onClick={() => handleUndeleteSlider(params.row.id)}>
                            Undelete
                        </Button>
                    )}
                </>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, position: 'relative' }}>
                <Box sx={{ width: 150 }} /> {/* Spacer */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Slider Management</Typography>
                <Button variant="contained" color="primary" onClick={handleAddSlider} sx={{ borderRadius: 2 }}>
                    Add New Slider
                </Button>
            </Box>
            <Box style={{ height: 600, width: '100%' }}>
                <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        label="Search"
                        variant="outlined"
                        size="small"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by headline, category..."
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

                <DataGrid
                    rows={sliders}
                    columns={columns}
                    loading={loading}
                    rowCount={totalCount}
                    paginationMode="server"
                    onPaginationModelChange={(newModel) => {
                        handleChangePage(null, newModel.page);
                        if (newModel.pageSize !== rowsPerPage) {
                            setRowsPerPage(newModel.pageSize);
                        }
                    }}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: rowsPerPage, page: currentPage },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                />

                {isFormOpen && (
                    <SliderForm
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        initialData={selectedSlider}
                    />
                )}
            </Box>
        </Box>
    );
};

export default SliderManager;
