// src/components/CategoryManagement.js
import React, { useState } from 'react';
import { Paper, Typography, TextField, Button } from '@mui/material';
import Category from '../../../../models/Category';
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]); // Use useState to manage categories
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddCategory = () => {
    // Add a new category to the categories state
    const newCategory = new Category(categories.length + 1, newCategoryName);
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
  };

  // Implement category editing and deletion functions as needed

  return (
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h5" align="center">Category Management</Typography>
      <div>
        <TextField
          label="New Category"
          variant="outlined"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleAddCategory}>
          Add Category
        </Button>
      </div>
      {/* Render the list of categories with editing and deletion options */}
    </Paper>
  );
};

export default CategoryManagement;
