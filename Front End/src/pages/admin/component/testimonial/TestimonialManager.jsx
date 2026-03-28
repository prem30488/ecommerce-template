// TestimonialManager.js
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import axios from 'axios';
import TestimonialForm from './TestimonialForm';
import Alert from 'react-s-alert';
import { getTestimonials, deleteTestimonial, undeleteTestimonial, addTestimonial, updateTestimonial } from '../../../../util/APIUtils';
const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    getTestimonials(0, 100)
      .then((res) => {
        setTestimonials(res.content);
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
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
          fetchTestimonials();
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
          fetchTestimonials();
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
          fetchTestimonials();
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong.');
        });
      } else {
        await undeleteTestimonial(testimonial).then((res) => {
          Alert.success("Testimonial restored successfully!");
          fetchTestimonials();
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
      fetchTestimonials();
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

        params.row.imageURL ? <img src={params.row.imageURL} style={{ width: "100px", height: "100px" }} /> : ""

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
    <div>
      <Button variant="contained" color="primary" onClick={handleAddTestimonial}>
        Add Testimonial
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDeleteTestimonial}
        disabled={!selectedTestimonial || selectedTestimonial.deleteflag === 'inactive'}
      >
        Delete Testimonial
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUndeleteTestimonial}
        disabled={!selectedTestimonial || selectedTestimonial.deleteflag === 'active'}
      >
        Undelete Testimonial
      </Button>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={testimonials}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          onRowSelectionModelChange={(newRowSelectionModel) => {
            const selectedId = newRowSelectionModel[0];
            const selectedTestimonial = testimonials.find((t) => t.id === selectedId);
            setSelectedTestimonial(selectedTestimonial);
          }}
        />
      </div>
      {isFormOpen && (
        <TestimonialForm
          key={selectedTestimonial ? selectedTestimonial.id : 'new'}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={selectedTestimonial}
        />
      )}
    </div>
  );
};

export default TestimonialManager;
