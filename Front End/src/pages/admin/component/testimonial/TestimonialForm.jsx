import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FileUploader from '../product/FileUploader';
import { resolveImageUrl } from '../../../../util/imageUrl';

const TestimonialForm = ({ open, onSubmit, onCancel, initialData }) => {
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
    setFormData((prev) => ({ ...prev, imageURL: fileURL }));
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9' }}>
        {initialData ? 'Edit Testimonial' : 'Add Testimonial'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
              multiline
              rows={3}
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

            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography component="legend" color="textSecondary" sx={{ mb: 1 }}>
                Feedback Rating
              </Typography>
              <Rating
                name="rating"
                value={Number(formData.rating) || 5}
                onChange={(event, newValue) => {
                  setFormData((prevData) => ({ ...prevData, rating: newValue }));
                }}
                size="large"
              />
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, fontWeight: 'bold' }}>
                Reviewer Photo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={resolveImageUrl(formData.imageURL)}
                  sx={{ width: 72, height: 72, border: '2px solid #e2e8f0' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formData.imageURL ? 'Current photo' : 'No photo uploaded'}
                </Typography>
              </Box>
              <FileUploader maxNoFiles={1} onSave={returnFileArray} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={onCancel} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TestimonialForm;
