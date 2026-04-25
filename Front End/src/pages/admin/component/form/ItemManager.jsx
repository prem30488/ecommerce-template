import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  TextareaAutosize,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Box,
  TablePagination,
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { getForms, fetchFormById, updateForm, addForm, deleteForm, undeleteForm } from '../../../../util/APIUtils';
import { getCurrentDate } from '../../../../util/util';
import Alert from 'react-s-alert';
function ItemManager() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const fetchFormsList = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getForms(page, rowsPerPage, search);
      setItems(res.content || []);
      setTotalElements(res.totalElements || 0);
    } catch (error) {
      Alert.error((error && error.message) || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormsList(0, searchQuery);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchFormsList(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchFormsList(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchFormsList(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    fetchFormsList(0, searchQuery);
  };

  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [showDeleted, setShowDeleted] = useState(true);

  const [editDescription, setEditDescription] = useState('');
  const [editItemId, setEditItemId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      title,
      description,
      deleteFlag,
    };

    addForm(newItem).then(res => {
      Alert.success("Success!");
      setTitle('');
      setDescription('');
      setItems((prevItems) => [...prevItems, res]);
      clearForm();
      fetchFormsList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleUpdateItem = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, title, description, deleteFlag } : item
    );
    setItems(updatedItems);
    clearForm();
  };

  const handleDeleteItem = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, deleteFlag: true } : item
    );

    fetchFormById(id).then(res => {
      let item = res;
      if (item) {

        item.deleteFlag = true;
        item.updatedAt = getCurrentDate('-');
        deleteForm(item).then(res => {
          Alert.success("Success!");
          setItems(updatedItems);
          fetchFormsList(currentPage, searchQuery);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      }
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleUndeleteItem = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, deleteFlag: false } : item
    );


    fetchFormById(id).then(res => {
      let item = res;
      if (item) {

        item.deleteFlag = false;
        item.updatedAt = getCurrentDate('-');
        undeleteForm(item).then(res => {
          Alert.success("Success!");
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      }
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
    setItems(updatedItems);
  };

  const handleEditForm = (id) => {
    const formToEdit = items.find((item) => item.id === id);
    if (formToEdit) {
      setEditItemId(id);
      setEditTitle(formToEdit.title);
      setEditDescription(formToEdit.description);
    }
  };

  const handleSaveEdit = () => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === editItemId
          ? { ...item, title: editTitle, description: editDescription }
          : item
      )
    );

    fetchFormById(editItemId).then(res => {
      let item = res;
      if (item) {
        item.description = editDescription;
        item.title = editTitle;
        item.updatedAt = getCurrentDate('-');
        updateForm(item).then(res => {
          Alert.success("Success!");
          setEditItemId(null);
          setEditTitle('');
          setEditDescription('');
          fetchFormsList(currentPage, searchQuery);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      }
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });


  };
  const handleCancelSaveEdit = () => {
    setEditItemId(null);
    setEditTitle(editTitle);
    setEditDescription(editDescription);
  }

  const clearForm = () => {
    setId('');
    setTitle('');
    setDescription('');
    setDeleteFlag(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'title', headerName: 'Title', width: 200, renderCell: (params) =>
        editItemId === params.row.id ? (
          <TextField
            size="small"
            variant="standard"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        ) : (
          params.row.title
        ),
    },
    {
      field: 'description', headerName: 'Description', width: 400, renderCell: (params) =>
        editItemId === params.row.id ? (
          <TextField
            size="small"
            variant="standard"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        ) : (
          params.row.description
        ),
    },
    {
      field: 'deleteFlag',
      headerName: 'Delete Flag',
      width: 150,
      renderCell: (params) => (
        <div>
          {params.row.deleteFlag ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleUndeleteItem(params.row.id)}
            >
              Undelete
            </Button>
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={params.row.deleteFlag}
                  onChange={(e) => handleDeleteItem(params.row.id)}
                />
              }
              label="Active"
            />
          )}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        editItemId === params.row.id ? (
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelSaveEdit}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleEditForm(params.row.id)}
            >
              Edit
            </Button>

          </div>
        )
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ 
        color: 'var(--color-text, #1e293b)', 
        fontWeight: 'bold', 
        mb: 4,
        textAlign: { xs: 'center', md: 'left' }
      }}>
        Form Management
      </Typography>

      {/* Add New Item Form */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: '16px', 
        bgcolor: 'var(--color-bg-paper, #fff)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid var(--color-divider, #f1f5f9)'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: '600', mb: 2, color: 'var(--color-text-secondary, #64748b)' }}>
          Add New Form Detail
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, 
          gap: 2, 
          alignItems: 'start' 
        }}>
          <TextField
            fullWidth
            label="Title"
            variant="outlined"
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            size="small"
            multiline
            rows={1}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={deleteFlag}
                onChange={(e) => setDeleteFlag(e.target.value)}
                label="Status"
              >
                <MenuItem value={false}>Active</MenuItem>
                <MenuItem value={true}>Deleted</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddItem}
              sx={{ minWidth: '100px', borderRadius: '8px', textTransform: 'none' }}
            >
              Add
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
              />
            }
            label={<Typography variant="caption">Show Deleted Items</Typography>}
          />
        </Box>
      </Paper>

      {/* Search Bar */}
      <Box sx={{ 
        mb: 4, 
        p: 2, 
        bgcolor: 'var(--color-bg-paper, #f8fafc)', 
        borderRadius: 4, 
        border: '1px solid var(--color-divider, #f1f5f9)',
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, 
        alignItems: 'center' 
      }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title/description..."
        />
        <Button
          variant="outlined"
          size="medium"
          onClick={handleClearSearch}
          startIcon={<ClearIcon />}
          sx={{ width: { xs: '100%', sm: 'auto' }, whiteSpace: 'nowrap', borderRadius: '8px' }}
        >
          Clear
        </Button>
      </Box>

      {/* Data Table */}
      <Box sx={{ 
        height: { xs: 400, md: 600 }, 
        width: '100%',
        '& .MuiDataGrid-root': {
          border: 'none',
          backgroundColor: 'var(--color-bg-paper, #fff)',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }
      }}>
        <DataGrid
          rows={items}
          columns={columns}
          loading={loading}
          rowCount={totalElements}
          paginationMode="server"
          onPaginationModelChange={(newModel) => {
            handleChangePage(null, newModel.page);
            if (newModel.pageSize !== rowsPerPage) {
              setRowsPerPage(newModel.pageSize);
            }
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: rowsPerPage, page: currentPage },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          pagination
        />
      </Box>
    </Box>
  );
}

export default ItemManager;
