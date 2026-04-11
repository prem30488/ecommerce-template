import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Clear as ClearIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { getLeadershipTeams, addLeadershipTeam, updateLeadershipTeam, deleteLeadershipTeam, uploadLeadershipImage } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import { resolveImageUrl } from '../../../../util/imageUrl';

function LeadershipManager() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [teams, setTeams] = useState([]);

  // Form State
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(0);

  const fetchLeadershipList = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getLeadershipTeams(page, rowsPerPage, search);
      setTeams(res.content || []);
      setTotalCount(res.totalElements || 0);
    } catch (error) {
      console.error('Error fetching leadership teams:', error);
      Alert.error('Failed to load leadership teams');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeadershipList(0, searchQuery);
  }, []);

  const handleOpen = (member = null) => {
    if (member) {
      setId(member.id);
      setName(member.name);
      setDesignation(member.designation);
      setImage(member.image);
      setOrder(member.order);
    } else {
      setId(null);
      setName('');
      setDesignation('');
      setImage('');
      setOrder(0);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
      const res = await uploadLeadershipImage(file);
      // Assuming res contains the file URL
      setImage(res);
      Alert.success("Image uploaded!");
    } catch (err) {
      Alert.error("Failed to upload image: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!name || !designation) {
      Alert.error("Please fill in Name and Designation");
      return;
    }
    const payload = { name, designation, image, order: parseInt(order) };
    if (id) {
      payload.id = id;
      updateLeadershipTeam(payload).then(() => {
        Alert.success("Updated successfully!");
        handleClose();
        fetchLeadershipList(currentPage, searchQuery);
      }).catch(err => Alert.error(err.message || 'Update failed'));
    } else {
      addLeadershipTeam(payload).then(() => {
        Alert.success("Added successfully!");
        handleClose();
        fetchLeadershipList(0, searchQuery);
      }).catch(err => Alert.error(err.message || 'Add failed'));
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchLeadershipList(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchLeadershipList(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchLeadershipList(newPage, searchQuery);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      deleteLeadershipTeam(id).then(() => {
        Alert.success("Deleted!");
        fetchLeadershipList(currentPage, searchQuery);
      }).catch(err => Alert.error(err.message || 'Delete failed'));
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'image',
      headerName: 'Photo',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={resolveImageUrl(params.value)}
          variant="rounded"
          sx={{ width: 45, height: 45, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0' }}
        >
          {params.row.name?.charAt(0)}
        </Avatar>
      )
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'designation', headerName: 'Designation', flex: 1, minWidth: 150 },
    { field: 'order', headerName: 'Order', width: 80 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" color="primary" onClick={() => handleOpen(params.row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ width: 40 }} /> {/* Spacer */}
        <Typography variant="h5" sx={{ color: '#1e293b' }}>Leadership Team Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          Add Member
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#f8fafc', p: 2, borderRadius: 3, border: '1px solid #f1f5f9' }}>
        <TextField
          fullWidth
          label="Search members..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
        />
        <Button
          variant="outlined"
          onClick={handleClearSearch}
          startIcon={<ClearIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Clear
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%', bgcolor: 'white', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <DataGrid
          rows={teams}
          columns={columns}
          loading={loading}
          rowCount={totalCount}
          paginationMode="server"
          onPaginationModelChange={(newModel) => {
            handleChangePage(null, newModel.page);
            if (newModel.pageSize !== rowsPerPage) {
              setRowsPerPage(newModel.pageSize);
              fetchLeadershipList(0, searchQuery);
            }
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: rowsPerPage, page: currentPage },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 'bold' },
            '& .MuiDataGrid-cell:focus': { outline: 'none' }
          }}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9' }}>
          {id ? 'Edit Leadership Member' : 'Add Leadership Member'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 1 }}>
              <Avatar src={resolveImageUrl(image)} variant="rounded" sx={{ width: 120, height: 120, border: '2px solid #e2e8f0' }} />
              <Box>
                <input
                  accept="image/jpeg,image/png,image/jpg"
                  style={{ display: 'none' }}
                  id="leadership-photo-upload"
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="leadership-photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  JPG, JPEG or PNG only.
                </Typography>
              </Box>
            </Box>
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Display Order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              helperText="Higher numbers appear later"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ px: 4 }}>
            {id ? 'Save Changes' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LeadershipManager;
