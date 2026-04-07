import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  Box,
  Typography,
} from '@mui/material';
import FileUploader from './FileUploader';

import { API_BASE_URL } from '../../../../constants';
import axios from 'axios';

function AddOrEditProduct({ product, categories, forms, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...product,
    ProductImages: product?.ProductImages || [],
    audience: product?.audience || '',
    productFlavors: product?.productFlavors || [{ flavor_id: '', price: '', priceMedium: '', priceLarge: '' }]
  });
  const [flavors, setFlavors] = useState([]);
  const [currentFlavorId, setCurrentFlavorId] = useState('');
  const [folderImages, setFolderImages] = useState([]);

  const fetchFolderImages = useCallback(async () => {
    if (!currentFlavorId) {
      setFolderImages([]);
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const pId = product?.id || 'temp';
      const res = await axios.get(`${API_BASE_URL}/api/product/images/${pId}/${currentFlavorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolderImages(res.data || []);
    } catch (err) {
      console.error('Error fetching folder images:', err);
    }
  }, [currentFlavorId, product?.id]);

  useEffect(() => {
    fetchFolderImages();
  }, [fetchFolderImages]);

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await axios.get(`${API_BASE_URL}/api/flavor/getFlavors?size=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFlavors(res.data.content || []);
      } catch (err) {
        console.error('Error fetching flavors:', err);
      }
    };
    fetchFlavors();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (name === "form") {
      setFormData(prev => ({ ...prev, formId: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formData.formId = formData.form;
    if (product.id && product.id !== 0) {
      formData.id = product.id;
    } else {
      formData.id = 0;
    }
    onSave(formData);
  };

  const handleCategoryChange = (event) => {
    const val = event.target.value;
    setFormData(prev => ({ ...prev, catIds: val }));
  };

  const handleCheckboxChange = (value) => {
    const freshArray = formData.audience ? formData.audience.split(',').map(s => s.trim()).filter(Boolean) : [];
    const exists = freshArray.includes(value.toString());
    let newAudience = '';

    if (exists) {
      newAudience = freshArray.filter(a => a !== value.toString()).join(',');
    } else {
      newAudience = [...freshArray, value.toString()].join(',');
    }

    setFormData(prev => ({ ...prev, audience: newAudience }));
  };

  const returnFileArray = (fileURL, detectedFlavorId) => {
    if (fileURL === 'removeAll') {
      setFormData(prev => ({ ...prev, ProductImages: [] }));
      return;
    }

    const flavorToUse = detectedFlavorId || currentFlavorId;

    const newImage = {
      url: fileURL,
      flavor_id: flavorToUse ? Number(flavorToUse) : null
    };

    setFormData(prev => ({
      ...prev,
      ProductImages: [...(prev.ProductImages || []), newImage]
    }));

    // Refresh folder images too
    setTimeout(fetchFolderImages, 500);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
        {product && product.id && product.id !== null && formData ? 'Edit Product' : 'Add Product'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          <TextField
            fullWidth
            name="title"
            label="Product Name"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            name="stock"
            label="Stock Qty"
            value={formData.stock}
            onChange={handleChange}
            type="number"
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Form</InputLabel>
              <Select
                name="form"
                value={formData.form}
                onChange={handleChange}
                label="Form"
              >
                {forms.map((form) => (
                  form ?
                    <MenuItem key={form.id} value={form.id}>
                      {form.title}
                    </MenuItem>
                    : ""
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                name="categories"
                value={formData.catIds}
                onChange={handleCategoryChange}
                label="Categories"
              >
                {categories.map((category) => (
                  category ?
                    <MenuItem key={category.id} value={category.id}>
                      {category.title}
                    </MenuItem>
                    : ""
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleChange}
              />
            }
            label="Bestseller"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
            }
            label="Featured"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="comingSoon"
                checked={formData.comingSoon}
                onChange={handleChange}
              />
            }
            label="Coming Soon"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          <TextField
            fullWidth
            name="rating"
            label="Rating (5/5)"
            value={formData.rating}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            name="hmsCode"
            label="HSN Code"
            value={formData.hmsCode}
            onChange={handleChange}
            required
          />
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#475569', mb: 3, px: 1, letterSpacing: '0.05em' }}>
            FLAVORS & PRICING
          </Typography>
          {formData.productFlavors.map((pf, index) => (
            <Box key={index} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200, flex: 1 }}>
                <InputLabel>Flavor</InputLabel>
                <Select
                  value={pf.flavor_id}
                  onChange={(e) => {
                    const newFlavors = [...formData.productFlavors];
                    newFlavors[index].flavor_id = e.target.value;
                    setFormData({ ...formData, productFlavors: newFlavors });
                  }}
                  required
                  label="Flavor"
                >
                  {flavors.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                sx={{ width: 150 }}
                label="Price Small"
                value={pf.price}
                onChange={(e) => {
                  const newFlavors = [...formData.productFlavors];
                  newFlavors[index].price = e.target.value;
                  setFormData({ ...formData, productFlavors: newFlavors });
                }}
                required
                type="number"
              />
              <TextField
                sx={{ width: 150 }}
                label="Price Medium"
                value={pf.priceMedium}
                onChange={(e) => {
                  const newFlavors = [...formData.productFlavors];
                  newFlavors[index].priceMedium = e.target.value;
                  setFormData({ ...formData, productFlavors: newFlavors });
                }}
                type="number"
              />
              <TextField
                sx={{ width: 150 }}
                label="Price Large"
                value={pf.priceLarge}
                onChange={(e) => {
                  const newFlavors = [...formData.productFlavors];
                  newFlavors[index].priceLarge = e.target.value;
                  setFormData({ ...formData, productFlavors: newFlavors });
                }}
                type="number"
              />
              <Button color="error" variant="outlined" onClick={() => {
                const newFlavors = formData.productFlavors.filter((_, i) => i !== index);
                setFormData({ ...formData, productFlavors: newFlavors });
              }}>Remove</Button>
            </Box>
          ))}
          <Button 
            variant="outlined" 
            sx={{ mt: 1 }}
            onClick={() => setFormData({ ...formData, productFlavors: [...formData.productFlavors, { flavor_id: '', price: '', priceMedium: '', priceLarge: '' }] })}
          >
            + Add Flavor Variant
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3, mt: 4, mb: 4 }}>
          <TextField
            fullWidth
            name="unitSmall"
            label="Unit Small"
            value={formData.unitSmall}
            onChange={handleChange}
            required
            type="number"
          />
          <TextField
            fullWidth
            name="unitMedium"
            label="Unit Medium"
            value={formData.unitMedium}
            onChange={handleChange}
            required
            type="number"
          />
          <TextField
            fullWidth
            name="unitLarge"
            label="Unit Large"
            value={formData.unitLarge}
            onChange={handleChange}
            required
            type="number"
          />
        </Box>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Unit</InputLabel>
          <Select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            label="Unit"
          >
            <MenuItem value="days">days</MenuItem>
            <MenuItem value="ml">ml</MenuItem>
            <MenuItem value="grams">grams</MenuItem>
            <MenuItem value="kg">kg</MenuItem>
            <MenuItem value="Capsules">Capsules</MenuItem>
            <MenuItem value="Gummies">Gummies</MenuItem>
            <MenuItem value="mg">mg</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Target Audience</Typography>
          <FormGroup sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.audience.includes('Men')}
                  onChange={() => handleCheckboxChange('Men')}
                />
              }
              label="Men"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.audience.includes('Women')}
                  onChange={() => handleCheckboxChange('Women')}
                />
              }
              label="Women"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.audience.includes('Kids')}
                  onChange={() => handleCheckboxChange('Kids')}
                />
              }
              label="Kids"
            />
          </FormGroup>
        </Box>

        {/* Flavor Selection for images */}
        <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#475569', mb: 3, px: 2, letterSpacing: '0.05em' }}>
            IMAGE FLAVOR SETUP
          </Typography>
          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Select Flavor for Upload</InputLabel>
            <Select
              value={currentFlavorId}
              onChange={(e) => setCurrentFlavorId(e.target.value)}
              label="Select Flavor for Upload"
            >
              <MenuItem value=""><em>None / Default</em></MenuItem>
              {flavors.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 25, borderRadius: 1, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                      {f.image ? (
                        <img
                          src={f.image.startsWith('http') ? f.image : `${API_BASE_URL}${f.image}`}
                          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                          alt=""
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', bgcolor: '#f1f5f9' }} />
                      )}
                    </Box>
                    <Typography variant="body2">{f.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FileUploader
            key={currentFlavorId}
            maxNoFiles={10}
            onSave={returnFileArray}
            productId={product?.id || 'temp'}
            flavorId={currentFlavorId}
          />

          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 'black', color: '#94a3b8', letterSpacing: '0.15em' }}>
                FLAVOR PREVIEW SECTION
              </Typography>
              {currentFlavorId && (
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#0ea5e9', bgcolor: '#f0f9ff', px: 2, py: 0.5, borderRadius: 10, border: '1px solid #bae6fd' }}>
                  VIEWING: {flavors.find(f => String(f.id) === String(currentFlavorId))?.name}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, minHeight: 160, p: 3, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 4, border: '2px dashed #e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
              {(() => {
                const filtered = folderImages;

                if (filtered.length === 0) {
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, opacity: 0.6 }}>
                      <Box sx={{ width: 80, height: 120, border: '2px dashed #cbd5e1', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#94a3b8', bgcolor: '#f8fafc' }}>
                        +
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', letterSpacing: '0.05em' }}>NO IMAGES YET</Typography>
                    </Box>
                  );
                }

                return filtered.map((imagePath, idx) => {
                  const flavorName = flavors.find(f => String(f.id) === String(currentFlavorId))?.name || 'Default';
                  return (
                    <Box key={idx} sx={{ position: 'relative', width: 100, height: 150, border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', bgcolor: 'white', '&:hover': { boxShadow: 6 }, transition: 'all 0.3s' }}>
                      <img
                        src={imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt="Product variant"
                      />
                      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(15,23,42,0.8)', p: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'white', display: 'block', textAlign: 'center', fontSize: '0.65rem' }}>
                          {flavorName}
                        </Typography>
                      </Box>
                    </Box>
                  );
                });
              })()}
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button type="submit" variant="contained" color="primary" sx={{ px: 6, py: 1.5, borderRadius: 3 }}>
            {product && product.id && product.id !== 0 ? 'Update Product' : 'Add Product'}
          </Button>
          <Button variant="outlined" color="secondary" onClick={onCancel} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Cancel
          </Button>
        </Box>
      </form>
    </Box>
  );
}

export default AddOrEditProduct;
