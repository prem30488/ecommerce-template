import React, { useState, useEffect } from 'react';
import {
  TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { uploadSliderImage, getCategoriesShort } from '../../../../util/APIUtils';
import { resolveImageUrl } from '../../../../util/imageUrl';
import Alert from 'react-s-alert';

const SliderForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    src: '',
    headline: '',
    body: '',
    cta: '',
    category: ''
  });
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories once on mount
  useEffect(() => {
    getCategoriesShort()
      .then(res => setCategories(res.content || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      Alert.error("Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadSliderImage(file);
      setFormData(prev => ({ ...prev, src: res }));
      Alert.success("Image uploaded!");
    } catch (err) {
      Alert.error("Failed to upload image: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.src) {
        Alert.error("Please upload an image first!");
        return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Slider' : 'Add Slider'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#475569' }}>Slider Image</Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {formData.src ? (
                <img 
                  src={resolveImageUrl(formData.src)} 
                  alt="Preview" 
                  style={{ width: '120px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
              ) : (
                <Box sx={{ width: '120px', height: '70px', bgcolor: '#f1f5f9', borderRadius: '8px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary">No Image</Typography>
                </Box>
              )}
              <Box>
                <input
                  accept="image/jpeg,image/png,image/jpg"
                  style={{ display: 'none' }}
                  id="slider-image-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="slider-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    disabled={uploading}
                    size="small"
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  JPG, JPEG or PNG only.
                </Typography>
              </Box>
            </Box>
          </Box>

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
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              label="Category"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="secondary">
            Cancel
          </Button>
          <Button type="submit" color="primary" variant="contained" disabled={uploading}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SliderForm;
