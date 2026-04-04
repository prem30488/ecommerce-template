import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
  TablePagination,
  Box,
  InputAdornment,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../../../constants';
import Alert from 'react-s-alert';

const FlavorManager = () => {
  const [flavors, setFlavors] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentFlavor, setCurrentFlavor] = useState({ name: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchFlavors = async (p = 0, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        page: p,
        size: rowsPerPage,
        search: search.trim()
      };
      const response = await axios.get(`${API_BASE_URL}/api/flavor/getFlavors`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setFlavors(response.data.content || []);
      setTotalCount(response.data.totalElements || 0);
    } catch (error) {
      console.error('Error fetching flavors:', error);
      Alert.error('Failed to load flavors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlavors(0, searchQuery);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setPage(0);
    fetchFlavors(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    fetchFlavors(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchFlavors(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    fetchFlavors(0, searchQuery);
  };

  const handleOpen = (flavor = { name: '' }) => {
    setCurrentFlavor(flavor);
    setIsEditing(!!flavor.id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentFlavor({ name: '' });
  };

  const handleImageUpload = async (file) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      console.log(`Uploading flavor icon for ID: ${currentFlavor.id || 'temp'}...`);

      const res = await axios.post(`${API_BASE_URL}/api/flavor/upload?flavorId=${currentFlavor.id || 'temp'}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Upload response:', res.data);
      setCurrentFlavor({ ...currentFlavor, image: res.data });
      Alert.success('Image uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err.response || err);
      Alert.error('Failed to upload image. Please check console for details.');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/api/flavor/${currentFlavor.id}`, currentFlavor, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.success('Flavor updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/flavor/createFlavor`, currentFlavor, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.success('Flavor created successfully');
      }
      setPage(0);
      fetchFlavors(0, searchQuery);
      handleClose();
    } catch (error) {
      console.error('Error saving flavor:', error);
      Alert.error('Failed to save flavor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flavor?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_BASE_URL}/api/flavor/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.success('Flavor deleted successfully');
        fetchFlavors(page, searchQuery);
      } catch (error) {
        console.error('Error deleting flavor:', error);
        Alert.error('Failed to delete flavor');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Flavor Management</h2>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          className="bg-sky-600 hover:bg-sky-700"
        >
          Add New Flavor
        </Button>
      </div>

      {/* Search Bar */}
      <Box className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex gap-2">
          <TextField
            fullWidth
            placeholder="Search flavors by name..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400" />
                </InputAdornment>
              ),
            }}
          />
          {searchQuery && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearSearch}
              className="whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </Box>

      <TableContainer component={Paper} className="shadow-xl rounded-2xl border border-slate-100">
        <Table>
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableCell className="font-bold text-slate-600">ID</TableCell>
              <TableCell className="font-bold text-slate-600">Preview</TableCell>
              <TableCell className="font-bold text-slate-600">Flavor Name</TableCell>
              <TableCell className="font-bold text-slate-600 text-right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flavors.map((flavor) => (
              <TableRow key={flavor.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>{flavor.id}</TableCell>
                <TableCell>
                  <div className="w-[50px] h-[75px] rounded-lg border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                    {flavor.image ? (
                      <img
                        src={flavor.image.startsWith('http') ? flavor.image : `${API_BASE_URL}${flavor.image}`}
                        className="w-[50px] h-[75px]"
                        style={{ "height": "30%", "width": "100%" }}
                        alt={flavor.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-300 font-bold tracking-tighter">N/A</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-700">{flavor.name}</TableCell>
                <TableCell className="text-right">
                  <IconButton onClick={() => handleOpen(flavor)} color="primary" className="mr-2">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(flavor.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {flavors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                  {loading ? 'Loading...' : 'No flavors found. Create one to get started!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle className="font-bold border-b border-slate-100 pb-4">
          {isEditing ? 'Edit Flavor' : 'Add New Flavor'}
        </DialogTitle>
        <DialogContent className="pt-6">
          <TextField
            autoFocus
            margin="dense"
            label="Flavor Name"
            fullWidth
            variant="outlined"
            value={currentFlavor.name}
            onChange={(e) => setCurrentFlavor({ ...currentFlavor, name: e.target.value })}
            className="mb-6"
          />

          <div className="mt-4">
            <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-widest block mb-2">
              Flavor Visual Icon
            </Typography>
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-[100px] h-[150px] flex-shrink-0 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shadow-slate-200/50">
                {currentFlavor.image ? (
                  <img
                    src={currentFlavor.image.startsWith('http') ? currentFlavor.image : `${API_BASE_URL}${currentFlavor.image}`}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-light">?</div>
                )}
              </div>
              <div className="flex-grow">
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  className="mb-2"
                >
                  Select Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  />
                </Button>
                <Typography variant="caption" className="block text-slate-400 leading-tight">
                  Single 100x100 recommended
                </Typography>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t border-slate-100 bg-slate-50">
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained" disabled={!currentFlavor.name.trim()}>
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlavorManager;
