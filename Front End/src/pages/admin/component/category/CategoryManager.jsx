import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { getCategories, addCategory, fetchCategoryById, updateCategory, deleteCategory } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import { getCurrentDate } from '../../../../util/util';

function CategoryManager() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState(1);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState(1);

  const fetchCategoriesList = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getCategories(page, rowsPerPage, search);
      setCategories(res.content || []);
      setTotalCount(res.totalElements || 0);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList(0, searchQuery);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchCategoriesList(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchCategoriesList(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchCategoriesList(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setRowsPerPage(newSize);
    setCurrentPage(0);
    fetchCategoriesList(0, searchQuery);
  };

  const handleAddCategory = () => {
    const categoryObj = { title: title, type: type, description: ' ', createdAt: getCurrentDate('-') };
    addCategory(categoryObj).then(res => {
      Alert.success("Success!");
      setTitle('');
      setType(1);
      fetchCategoriesList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleEditCategory = (id) => {
    const categoryToEdit = categories.find((category) => category.id === id);
    if (categoryToEdit) {
      setEditCategoryId(id);
      setEditTitle(categoryToEdit.title);
      setEditType(categoryToEdit.type);
    }
  };

  const handleSaveEdit = () => {
    fetchCategoryById(editCategoryId).then(res => {
      let cat = res;
      if (cat) {
        cat.title = editTitle;
        cat.type = editType;
        cat.updatedAt = getCurrentDate('-');
        updateCategory(cat).then(res => {
          Alert.success("Success!");
          setEditCategoryId(null);
          setEditTitle('');
          setEditType(1);
          fetchCategoriesList(currentPage, searchQuery);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      }
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleCancelSaveEdit = () => {
    setEditCategoryId(null);
  };

  const handleDeleteCategory = (id) => {
    deleteCategory(id).then(res => {
      Alert.success("Success!");
      fetchCategoriesList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleMoveCategory = async (id, direction) => {
    const index = categories.findIndex((category) => category.id === id);
    if (index === -1) return;

    let targetIndex = -1;
    if (direction === 'up' && index > 0) {
      targetIndex = index - 1;
    } else if (direction === 'down' && index < categories.length - 1) {
      targetIndex = index + 1;
    }

    if (targetIndex !== -1) {
      const currentItem = { ...categories[index] };
      const targetItem = { ...categories[targetIndex] };

      // Swap their order values
      const tempOrder = currentItem.order;
      currentItem.order = targetItem.order;
      targetItem.order = tempOrder;

      try {
        setLoading(true);
        // Update both in the database
        await updateCategory(currentItem);
        await updateCategory(targetItem);
        Alert.success("Order updated successfully!");
        fetchCategoriesList(currentPage, searchQuery);
      } catch (error) {
        Alert.error((error && error.message) || 'Failed to update order.');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'title', headerName: 'Title', width: 200, renderCell: (params) =>
        editCategoryId === params.row.id ? (
          <TextField
            fullWidth
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />
        ) : (
          params.row.title
        ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) =>
        editCategoryId === params.row.id ? (
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              label="Type"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
          </FormControl>
        ) : (
          params.row.type
        ),
    },
    { field: 'order', headerName: 'Display Order', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 380,
      renderCell: (params) =>
        editCategoryId === params.row.id ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={handleCancelSaveEdit}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled={indexByRow(params.row.id) === 0 && currentPage === 0}
              onClick={() => handleMoveCategory(params.row.id, 'up')}
            >
              Up
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled={indexByRow(params.row.id) === categories.length - 1 && categories.length < rowsPerPage}
              onClick={() => handleMoveCategory(params.row.id, 'down')}
            >
              Down
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => handleEditCategory(params.row.id)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => handleDeleteCategory(params.row.id)}
            >
              Delete
            </Button>
          </Box>
        ),
    },
  ];

  const indexByRow = (id) => categories.findIndex(c => c.id === id);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 6 }}>
        <Typography variant="h5" sx={{ color: '#1e293b' }}>Category Management</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <TextField
          label="Title"
          variant="outlined"
          size="small"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            label="Type"
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </Box>

      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title..."
        />
        <Button
          variant="outlined"
          size="small"
          onClick={handleClearSearch}
          startIcon={<ClearIcon />}
        >
          Clear
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={categories}
          columns={columns}
          rowCount={totalCount}
          loading={loading}
          paginationMode="server"
          onPaginationModelChange={(model) => {
            if (model.page !== currentPage) {
              handleChangePage(null, model.page);
            }
            if (model.pageSize !== rowsPerPage) {
              setRowsPerPage(model.pageSize);
              fetchCategoriesList(0, searchQuery);
            }
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: rowsPerPage, page: currentPage },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </Box>
    </Box>
  );
}

export default CategoryManager;
