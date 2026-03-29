import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  Box,
  Typography,
  TablePagination
} from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import { getLeadershipTeams, addLeadershipTeam, updateLeadershipTeam, deleteLeadershipTeam } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';

function LeadershipManager() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [teams, setTeams] = useState([]);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [image, setImage] = useState('');
  const [order, setOrder] = useState(0);

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editOrder, setEditOrder] = useState(0);

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

  const reloadList = () => {
    fetchLeadershipList(currentPage, searchQuery);
  }

  React.useEffect(() => {
    fetchLeadershipList(0, searchQuery);
  }, []);

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

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    fetchLeadershipList(0, searchQuery);
  };

  const handleAdd = () => {
    const obj = { name, designation, image, order: parseInt(order) };
    addLeadershipTeam(obj).then(res => {
      Alert.success("Leadership team member added!");
      setName('');
      setDesignation('');
      setImage('');
      setOrder(0);
      reloadList();
    }).catch(error => {
      Alert.error((error && error.message) || 'Failed to add.');
    });
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditName(row.name);
    setEditDesignation(row.designation);
    setEditImage(row.image);
    setEditOrder(row.order);
  };

  const handleSaveEdit = () => {
    const obj = { id: editId, name: editName, designation: editDesignation, image: editImage, order: parseInt(editOrder) };
    updateLeadershipTeam(obj).then(res => {
      Alert.success("Updated!");
      setEditId(null);
      fetchLeadershipList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Failed to update.');
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      deleteLeadershipTeam(id).then(res => {
        Alert.success("Deleted!");
        fetchLeadershipList(currentPage, searchQuery);
      }).catch(error => {
        Alert.error((error && error.message) || 'Failed to delete.');
      });
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'designation', headerName: 'Designation', width: 150 },
    { field: 'image', headerName: 'Image URL', width: 250 },
    { field: 'order', headerName: 'Order', width: 80 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => handleEdit(params.row)}>Edit</Button>
          <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Leadership Team Manager</Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4, bgcolor: '#f9f9f9', p: 2, borderRadius: 2 }}>
        <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField size="small" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
        <TextField size="small" label="Image Path" value={image} onChange={(e) => setImage(e.target.value)} />
        <TextField size="small" type="number" label="Order" value={order} onChange={(e) => setOrder(e.target.value)} />
        <Button variant="contained" onClick={handleAdd}>Add Member</Button>
      </Box>

      {editId && (
        <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="h6">Edit Member</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <TextField size="small" label="Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <TextField size="small" label="Designation" value={editDesignation} onChange={(e) => setEditDesignation(e.target.value)} />
            <TextField size="small" label="Image Path" value={editImage} onChange={(e) => setEditImage(e.target.value)} />
            <TextField size="small" type="number" label="Order" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} />
            <Button variant="contained" color="success" onClick={handleSaveEdit}>Save</Button>
            <Button variant="outlined" onClick={() => setEditId(null)}>Cancel</Button>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name, designation..."
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

      <Box sx={{ height: 400, width: '100%' }}>
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default LeadershipManager;
