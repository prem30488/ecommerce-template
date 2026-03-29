import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FileUploader from '../product/FileUploader';

const TestimonialForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const returnFileArray = (fileURL) => {
    console.log("parent :" + JSON.stringify(fileURL));
    setFormData((prev) => ({ ...prev, imageURL: fileURL }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Title"
        variant="outlined"
        name="title"
        value={formData.title || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Description"
        variant="outlined"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Designation"
        variant="outlined"
        name="designation"
        value={formData.designation || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Organization"
        variant="outlined"
        name="organization"
        value={formData.organization || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography component="legend" color="textSecondary" sx={{ mb: 1 }}>
          Feedback Rating
        </Typography>
        <Rating
          name="rating"
          value={Number(formData.rating) || 5}
          onChange={(event, newValue) => {
            setFormData((prevData) => ({
              ...prevData,
              rating: newValue,
            }));
          }}
          size="large"
        />
      </Box>
      {formData.imageURL?<img src ={formData.imageURL} style = {{width:"100px",height:"100px"}} /> : ""}
      <FileUploader maxNoFiles={1} onSave = {returnFileArray} />
      <Button variant="contained" color="primary" type="submit">
        Save
      </Button>
      <Button variant="contained" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
};

export default TestimonialForm;
