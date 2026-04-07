import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import UserForm from './UserForm';
import { deleteUser, signup, getCurrentUser, getPrivileges, updatePrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import { getCurrentDate } from '../../../../util/util';
import { updateUser, getUserList, updateRole } from "../../../../util/APIUtils";
import { API_BASE_URL, ACCESS_TOKEN } from '../../../../constants';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { Box, TextField, TablePagination, IconButton, Paper, Typography, Card } from '@mui/material';
import { Clear as ClearIcon, Edit as EditIcon, Delete as DeleteIcon, VpnKey as VpnKeyIcon, Search as SearchIcon } from '@mui/icons-material';
function UserManagement() {
  let flag = false;
  const initialUsers = [];
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUsersList = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getUserList(page, rowsPerPage, search);
      setUsers(res.content || []);
      setTotalCount(res.totalElements || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const reloadUserList = () => {
    fetchUsersList(currentPage, searchQuery);
  };

  const handleEdit = (id) => {
    const userToEdit = users.find((user) => user.id === id);
    setSelectedUser(userToEdit);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchUsersList(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchUsersList(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchUsersList(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    fetchUsersList(0, searchQuery);
  };

  const handleDelete = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setSelectedUser(null);
    deleteUser(id).then(res => {
      Alert.success("User deleted successfully.");
      fetchUsersList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleSubmit = (formData) => {

    const signUpRequest = Object.assign({}, {
      id: 0,
      name: 'name',
      username: formData.username,
      password: formData.password,
      email: formData.email,
      sex: 'MALE',
      phoneNumber: formData.phoneNumber,
      premium: false,
      imageURL: "no image",
      provider: 'local',
      createdAt: '',
      updatedAt: getCurrentDate('-')
    });



    if (selectedUser) {
      // Update existing user
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...formData } : user
      );
      setUsers(updatedUsers);
      signUpRequest.id = selectedUser.id;



      updateUser(signUpRequest)
        .then(res => {
          Alert.success("User updated successfully.");
          //this.setState({message : 'User updated successfully.'});
          //this.props.history.push('/users');
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      updateRole(selectedUser.id, formData.role)
        .then(res => {
          Alert.success("User updated successfully.");
          //this.setState({message : 'User updated successfully.'});
          //this.props.history.push('/users');
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
    } else {
      // Insert new user
      const newId = users.length + 1;
      signUpRequest.id = newId;
      signUpRequest.createdAt = getCurrentDate("-");
      const newUser = { id: newId, ...formData };
      setUsers([...users, newUser]);
      console.log('signUpRequest :', signUpRequest);
      signup(signUpRequest)
        .then(response => {
          Alert.success("Success!");
          //window.location.reload();
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });

    }


    setSelectedUser(null);
  };
  useEffect(() => {
    fetchUsersList(0, searchQuery);
  }, []);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openPrivilegesDialog, setOpenPrivilegesDialog] = useState(false);

  const handleOpenPrivileges = (userId) => {
    setSelectedUserId(userId);
    setOpenPrivilegesDialog(true);
    handleOpenDialog(userId);
  };

  const handleClosePrivileges = () => {
    setSelectedUserId(null);
    setOpenPrivilegesDialog(false);
  };

  const [privileges, setPrivileges] = useState({});
  const [openDialog, setOpenDialog] = useState(false);

  const handleCheckboxChange = (moduleName) => {
    setPrivileges((prevPrivileges) => ({
      ...prevPrivileges,
      [moduleName]: !prevPrivileges[moduleName],
    }));
  };

  const handleOpenDialog = (userId) => {
    // Fetch user privileges from the backend
    getPrivileges(userId)
      .then(response => {
        const data = response || {};
        console.log("privileges fetched:", data);
        setPrivileges({
          id: data.id,
          userId: data.user_id,
          categories: !!data.categories,
          forms: !!data.forms,
          products: !!data.products,
          orders: !!data.orders,
          coupons: !!data.coupons,
          testimonials: !!data.testimonials,
          flavors: !!data.flavors,
          faqs: !!data.faqs,
          reviews: !!data.reviews,
          sales: !!data.sales,
          sliders: !!data.sliders,
          leadership: !!data.leadership,
          deleteFlag: !!data.deleteFlag
        });
        setOpenDialog(true);
      })
      .catch(error => {
        console.error('Error fetching user privileges:', error);
        Alert.error('Failed to fetch user permissions. Please try again later.');
      });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSavePrivileges = () => {
    // Save user privileges to the backend
    updatePrivileges(selectedUserId, privileges)
      .then(() => {
        console.log('User privileges updated successfully');
        handleCloseDialog();
        Alert.success("Success!")
      })
      .catch(error => {
        console.error('Error updating user privileges:', error);
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>User Management</Typography>
          <Typography sx={{ color: '#64748b', mt: 0.5 }}>Manage user accounts, roles, and access privileges</Typography>
        </Box>
      </Box>

      {/* User Form Section */}
      <Card sx={{ mb: 4, borderRadius: 6, boxShadow: 3, border: '1px solid #f1f5f9', bgcolor: 'white', overflow: 'hidden' }}>
        <UserForm user={selectedUser} onSubmit={handleSubmit} />
      </Card>

      {/* Search Bar */}
      <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #f1f5f9', '&:hover': { bgcolor: '#f1f5f9' }, transition: 'all 0.3s' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by username, email, phone number..."
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            variant="outlined"
          />
          {searchQuery && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearSearch}
              startIcon={<ClearIcon />}
              sx={{ whiteSpace: 'nowrap', borderColor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Data Table */}
      <Paper sx={{ boxShadow: 4, borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden', bgcolor: 'white' }}>
        <DataGrid
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9', fontSize: '0.95rem' },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 'bold' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f8fafc' }
          }}
          rows={users}
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
          columns={[
            { field: 'id', headerName: 'ID', width: 50 },
            { field: 'username', headerName: 'Username', flex: 1 },
            { field: 'email', headerName: 'Email', flex: 1 },
            { field: 'password', headerName: 'Password', width: 60 },
            { field: 'delFlag', headerName: 'Deleted?', width: 30 },
            {
              field: 'roles',
              headerName: 'Role',
              flex: 1,
              renderCell: (params) => {
                if (params.value && params.value.length > 0) {
                  switch (params.value[0].name) {
                    case 'ROLE_SUPERADMIN':
                      return 'Super Admin';
                    case 'ROLE_ADMIN':
                      return 'Admin';
                    default:
                      return 'User';
                  }
                }
                return 'User';
              },
            },
            {
              field: 'actions',
              headerName: 'Actions',
              sortable: false,
              width: 180,
              renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                  {params.row.id === 1 ? (
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.05em', px: 1.5, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 10 }}>SYSTEM ADMIN</Typography>
                  ) : (
                    <>
                      <IconButton onClick={() => handleEdit(params.row.id)} color="primary" size="small" title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleOpenPrivileges(params.row.id)} color="secondary" size="small" title="Privileges">
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small" title="Delete">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Box>
              ),
            },
          ]}
        />

        {/* <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> */}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 6 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #f1f5f9', pb: 2, bgcolor: '#f8fafc', color: '#1e293b' }}>
          User Privileges Details
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 3 }}>
          <FormGroup sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {Object.entries(privileges)
              .map(([moduleName, isChecked]) => (
                moduleName !== "id" && moduleName !== "userId" && moduleName !== "deleteFlag" ?
                  <Box key={moduleName} sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 3, p: 1, '&:hover': { bgcolor: '#f8fafc', borderColor: '#bae6fd' }, transition: 'all 0.3s' }}>
                    <FormControlLabel
                      sx={{ m: 0, w: '100%' }}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(moduleName)}
                          color="primary"
                          sx={{ color: '#94a3b8' }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>{moduleName}</Typography>}
                    />
                  </Box>
                  : ""
              ))}
          </FormGroup>
        </DialogContent>
        <Box sx={{ p: 2.5, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: 1.5, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
          <Button onClick={handleCloseDialog} color="inherit" sx={{ fontWeight: 'bold', color: '#64748b', borderRadius: 3, px: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleSavePrivileges} color="primary" variant="contained" sx={{ fontWeight: 'bold', borderRadius: 3, px: 3 }}>
            Save Privileges
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
