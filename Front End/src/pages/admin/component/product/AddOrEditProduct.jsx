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
    <div>
      <h2>{product && product.id && product.id !== null && formData ? 'Edit Product' : 'Add Product'}</h2>
      <br />
      {/* <p>
        {JSON.stringify(formData)}
      </p> */}
      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          label="name"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
        />
        {/* Price mapped to flavors instead of root */}
        <TextField
          name="stock"
          label="Stock Qty"
          value={formData.stock}
          onChange={handleChange}
          type="number"
          required
        />
        <FormGroup>
          <FormControl>

            <InputLabel>Form</InputLabel>
            <Select
              name="form"
              value={formData.form}
              onChange={handleChange}
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

          <FormControl>

            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              name="categories"
              value={formData.catIds}
              onChange={handleCategoryChange}
            >
              {categories.map((category) => (
                category ?
                  <MenuItem key={category.id} value={category.id}
                  >
                    {category.title}
                  </MenuItem>
                  : ""
              ))}
            </Select>
          </FormControl>
        </FormGroup>
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
        <TextField
          name="rating"
          label="Rating (5/5)"
          value={formData.rating}
          onChange={handleChange}
          required
        />
        <TextField
          name="hmsCode"
          label="HSN Code"
          value={formData.hmsCode}
          onChange={handleChange}
          required
        />

        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="text-sm font-bold text-slate-700 mb-4 px-2">FLAVORS & PRICING</h4>
          {formData.productFlavors.map((pf, index) => (
            <div key={index} className="flex gap-4 mb-4 items-center">
              <FormControl fullWidth>
                <InputLabel>Flavor</InputLabel>
                <Select
                  value={pf.flavor_id}
                  onChange={(e) => {
                    const newFlavors = [...formData.productFlavors];
                    newFlavors[index].flavor_id = e.target.value;
                    setFormData({ ...formData, productFlavors: newFlavors });
                  }}
                  required
                >
                  {flavors.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
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
                label="Price Large"
                value={pf.priceLarge}
                onChange={(e) => {
                  const newFlavors = [...formData.productFlavors];
                  newFlavors[index].priceLarge = e.target.value;
                  setFormData({ ...formData, productFlavors: newFlavors });
                }}
                type="number"
              />
              <Button color="error" onClick={() => {
                const newFlavors = formData.productFlavors.filter((_, i) => i !== index);
                setFormData({ ...formData, productFlavors: newFlavors });
              }}>X</Button>
            </div>
          ))}
          <Button onClick={() => setFormData({ ...formData, productFlavors: [...formData.productFlavors, { flavor_id: '', price: '', priceMedium: '', priceLarge: '' }] })}>
             + Add Flavor Variant
          </Button>
        </div>

        <TextField
          name="unitMedium"
          label="Unit Medium"
          value={formData.unitMedium}
          onChange={handleChange}
          required
          type="Number"
        />

        <TextField
          name="unitLarge"
          label="Unit Large"
          value={formData.unitLarge}
          onChange={handleChange}
          required
          type="Number"
        />
        <TextField
          name="unitSmall"
          label="Unit Small"
          value={formData.unitSmall}
          onChange={handleChange}
          required
          type="Number"
        />
        <InputLabel>Unit</InputLabel>
        <Select
          name="unit"
          value={formData.unit}
          onChange={handleChange}
        >
          <MenuItem key="0" value="days"         >
            days
          </MenuItem>
          <MenuItem key="1" value="ml"         >
            ml
          </MenuItem>
          <MenuItem key="2" value="grams"         >
            grams
          </MenuItem>
          <MenuItem key="3" value="kg"         >
            kg
          </MenuItem>
          <MenuItem key="4" value="Capsules"         >
            Capsules
          </MenuItem>
          <MenuItem key="5" value="Gummies"         >
            Gummies
          </MenuItem>
          <MenuItem key="6" value="mg"         >
            mg
          </MenuItem>
        </Select>


        <FormGroup>
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
        {/* Flavor Selection for images */}
        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <h4 className="text-sm font-bold text-slate-700 mb-4 px-2">IMAGE FLAVOR SETUP</h4>
          <FormControl fullWidth className="mb-4">
            <InputLabel>Select Flavor for Upload</InputLabel>
            <Select
              value={currentFlavorId}
              onChange={(e) => setCurrentFlavorId(e.target.value)}
              label="Select Flavor for Upload"
            >
              <MenuItem value=""><em>None / Default</em></MenuItem>
              {flavors.map((f) => (
                  <MenuItem key={f.id} value={f.id} className="flex items-center gap-3">
                    <div className="w-[60px] h-[40px] rounded-lg border border-slate-100 bg-slate-50 flex-shrink-0 overflow-hidden">
                      {f.image ? (
                        <img 
                          src={f.image.startsWith('http') ? f.image : `http://localhost:5000${f.image}`} 
                          style={{ "height": "40px", "width": "60px" }}
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300">N/A</div>
                      )}
                    </div>
                    <span>{f.name}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

          <FileUploader 
            key={currentFlavorId} // Force fresh uploader for each flavor
            maxNoFiles={10} 
            onSave={returnFileArray} 
            productId={product?.id || 'temp'}
            flavorId={currentFlavorId}
          />

          <div className="mt-6 mb-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">FLAVOR PREVIEW SECTION</h5>
              {currentFlavorId && (
                <div className="text-[10px] font-bold text-sky-500 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 uppercase tracking-widest animate-pulse">
                  Viewing: {flavors.find(f => String(f.id) === String(currentFlavorId))?.name}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 min-h-[160px] p-4 bg-white/50 rounded-2xl border border-dotted border-slate-200 items-center justify-center">
              {(() => {
                const filtered = folderImages;

                if (filtered.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
                      <div className="w-[100px] h-[150px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-3xl font-thin bg-slate-50/50">
                        +
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest">No Images Yet</p>
                    </div>
                  );
                }

                return filtered.map((imagePath, idx) => {
                  const flavorName = flavors.find(f => String(f.id) === String(currentFlavorId))?.name || 'Default';
                  return (
                    <div key={idx} className="relative w-[100px] h-[150px] border border-slate-200 rounded-xl overflow-hidden bg-white group hover:shadow-lg transition-all flex-shrink-0">
                      <img
                        src={imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`}
                        className="w-full h-full object-cover"
                        alt="Product variant"
                      />
                      <div className="p-2 bg-slate-900/80 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                        <p className="text-[10px] text-white font-bold truncate text-center uppercase tracking-tighter">
                          {flavorName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(p => ({
                          ...p,
                          ProductImages: p.ProductImages.filter(item => item.url !== img.url)
                        }))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

        </div>
        </div>

        <br />
        <Button type="submit" variant="contained" color="primary" size="large" className="px-10 py-3 rounded-xl shadow-lg">
          {product && product.id && product.id !== 0 ? 'Update Product' : 'Add Product'}
        </Button>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </form >
    </div >
  );
}

export default AddOrEditProduct;
