// TestimonialManager.js
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { TextField, Box, TablePagination, Typography } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import TestimonialForm from './TestimonialForm';
import Alert from 'react-s-alert';
import { getTestimonials, deleteTestimonial, undeleteTestimonial, addTestimonial, updateTestimonial } from '../../../../util/APIUtils';
import { resolveImageUrl } from '../../../../util/imageUrl';
const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTestimonialsList = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getTestimonials(page, rowsPerPage, search);
      setTestimonials(res.content || []);
      setTotalCount(res.totalElements || 0);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      Alert.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonialsList(0, searchQuery);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchTestimonialsList(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchTestimonialsList(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchTestimonialsList(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    fetchTestimonialsList(0, searchQuery);
  };

  const handleAddTestimonial = () => {
    setSelectedTestimonial(null);
    setIsFormOpen(true);
  };

  const handleEditTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsFormOpen(true);
  };

  const handleDeleteTestimonial = async () => {
    if (selectedTestimonial) {
      try {
        await deleteTestimonial(selectedTestimonial).then((res) => {
          Alert.success("Success!");
          fetchTestimonialsList(currentPage, searchQuery);
          setSelectedTestimonial(null);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
        //await axios.delete(`/api/testimonials/${selectedTestimonial.id}`); // Replace with your API endpoint

      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleUndeleteTestimonial = async () => {
    if (selectedTestimonial) {
      try {
        await undeleteTestimonial(selectedTestimonial).then((res) => {
          Alert.success("Success!");
          fetchTestimonialsList(currentPage, searchQuery);
          setSelectedTestimonial(null);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
        //await axios.put(`/api/testimonials/undelete/${selectedTestimonial.id}`); // Replace with your API endpoint
      } catch (error) {
        console.error('Error undeleting testimonial:', error);
      }
    }
  };

  const handleToggleDeleted = async (testimonial, isDeleted) => {
    try {
      if (isDeleted) {
        await deleteTestimonial(testimonial).then((res) => {
          Alert.success("Testimonial deleted successfully!");
          fetchTestimonialsList(currentPage, searchQuery);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong.');
        });
      } else {
        await undeleteTestimonial(testimonial).then((res) => {
          Alert.success("Testimonial restored successfully!");
          fetchTestimonialsList(currentPage, searchQuery);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong.');
        });
      }
    } catch (error) {
      console.error('Error toggling deleted state:', error);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTestimonial) {
        await updateTestimonial(formData).then((res) => {
          Alert.success("Success!");
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
        //await axios.put(`/api/testimonials/${selectedTestimonial.id}`, formData); // Replace with your API endpoint
      } else {
        await addTestimonial(formData).then((res) => {
          Alert.success("Success!");
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
        //await axios.post('/api/testimonials', formData); // Replace with your API endpoint
      }
      fetchTestimonialsList(currentPage, searchQuery);
      setSelectedTestimonial(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleFormCancel = () => {
    setSelectedTestimonial(null);
    setIsFormOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'title', headerName: 'Title', width: 160 },
    { field: 'description', headerName: 'Description', flex: 5 },
    { field: 'designation', headerName: 'Designation', width: 200 },
    { field: 'organization', headerName: 'Organization', width: 200 },
    {
      field: 'imageURL', headerName: 'Image', width: 150,
      renderCell: (params) => (

        params.row.imageURL ? <img src={resolveImageUrl(params.row.imageURL)} style={{ width: "100px", height: "100px" }} /> : ""

      )
    },
    {
      field: 'deleteflag', headerName: 'Status', width: 140,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Switch
              color="error"
              checked={params.row.deleteFlag || false}
              onChange={(e) => handleToggleDeleted(params.row, e.target.checked)}
            />
          }
          label={params.row.deleteFlag ? 'Deleted' : 'Active'}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleEditTestimonial(params.row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ width: 150 }} />
        <Typography variant="h5" sx={{ color: '#1e293b' }}>Testimonial Management</Typography>
        <Button variant="contained" color="primary" onClick={handleAddTestimonial} sx={{ borderRadius: 2 }}>
          Add Testimonial
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteTestimonial}
          disabled={!selectedTestimonial || selectedTestimonial.deleteflag === 'inactive'}
        >
          Delete Selected
        </Button>
        <Button
          variant="outlined"
          color="success"
          onClick={handleUndeleteTestimonial}
          disabled={!selectedTestimonial || selectedTestimonial.deleteflag === 'active'}
        >
          Restore Selected
        </Button>
      </Box>

      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title, organization, description..."
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

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={testimonials}
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
          checkboxSelection
          onRowSelectionModelChange={(newRowSelectionModel) => {
            const selectedId = newRowSelectionModel[0];
            const selectedTestimonial = testimonials.find((t) => t.id === selectedId);
            setSelectedTestimonial(selectedTestimonial);
          }}
        />
      </div>

      <TestimonialForm
        open={isFormOpen}
        key={selectedTestimonial ? selectedTestimonial.id : 'new'}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        initialData={selectedTestimonial}
      />
    </Box>
  );
};

export default TestimonialManager;
