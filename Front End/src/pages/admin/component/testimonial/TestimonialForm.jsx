// TestimonialForm.js
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FileUploader from '../product/FileUploader';

const TestimonialForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {});

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
    console.log("parent :"+JSON.stringify(fileURL));
    formData.imageURL=fileURL;
  }

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
