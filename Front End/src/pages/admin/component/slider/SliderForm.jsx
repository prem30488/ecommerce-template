import React, { useState, useEffect } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const SliderForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    src: '',
    headline: '',
    body: '',
    cta: '',
    category: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Slider' : 'Add Slider'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Image URL (src)"
            name="src"
            value={formData.src}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Headline"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Body Content"
            name="body"
            value={formData.body}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
          <TextField
            label="Call to Action (CTA)"
            name="cta"
            value={formData.cta}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SliderForm;
