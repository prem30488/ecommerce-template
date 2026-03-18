// src/components/ProductManagement.js
import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Select, MenuItem } from '@mui/material';
import Product from '../../../../models/Product';
const ProductManagement = ({ categories }) => {
  const [products, setProducts] = useState([]); // Use useState to manage products
  const [newProductName, setNewProductName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id); // Default to the first category

  const handleAddProduct = () => {
    // Add a new product to the products state
    const newProduct = new Product(
      products.length + 1,
      newProductName,
      selectedCategory,
      0, // Price (you can set a default)
      0  // Quantity (you can set a default)
    );
    setProducts([...products, newProduct]);
    setNewProductName('');
  };

  // Implement product editing and deletion functions as needed

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" align="center">Product Management</Typography>
      <div>
        <TextField
          label="New Product"
          variant="outlined"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
        />
        <Select
          label="Category"
          variant="outlined"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={handleAddProduct}>
          Add Product
        </Button>
      </div>
      {/* Render the list of products with editing and deletion options */}
    </Paper>
  );
};

export default ProductManagement;
