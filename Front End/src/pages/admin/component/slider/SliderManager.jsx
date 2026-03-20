import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Switch, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SliderForm from './SliderForm';
import Alert from 'react-s-alert';
import { getSliders, addSlider, updateSlider, deleteSlider, undeleteSlider } from '../../../../util/APIUtils';

const SliderManager = () => {
    const [sliders, setSliders] = useState([]);
    const [selectedSlider, setSelectedSlider] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        fetchSliders();
    }, [page, pageSize]);

    const fetchSliders = async () => {
        getSliders(page, pageSize)
            .then((res) => {
                setSliders(res.content);
                setTotalElements(res.totalElements);
            }).catch(error => {
                Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
            });
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
                fetchSliders();
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
                fetchSliders();
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
                    fetchSliders();
                    setIsFormOpen(false);
                }).catch(error => {
                    Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
                });
            } else {
                await addSlider(formData).then((res) => {
                    Alert.success("Slider added successfully!");
                    fetchSliders();
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
                fetchSliders();
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
        <div style={{ height: 600, width: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
                <Button variant="contained" color="primary" onClick={handleAddSlider}>
                    Add New Slider
                </Button>
            </div>
            <DataGrid
                rows={sliders}
                columns={columns}
                rowCount={totalElements}
                paginationMode="server"
                onPaginationModelChange={(model) => {
                    setPage(model.page);
                    setPageSize(model.pageSize);
                }}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: pageSize, page: page },
                    },
                }}
                pageSizeOptions={[5, 10, 25]}
            />
            {isFormOpen && (
                <SliderForm
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    initialData={selectedSlider}
                />
            )}
        </div>
    );
};

export default SliderManager;
