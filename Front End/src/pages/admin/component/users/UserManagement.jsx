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
    // Fetch user privileges from the backend when the component mounts
    getPrivileges(userId)
      .then(response => {
        const data = response;
        console.log("privileges :" + JSON.stringify(data));
        setPrivileges({
          id: data.id,
          userId: data.user_id,
          categories: data.categories,
          forms: data.forms,
          products: data.products,
          orders: data.orders,
          coupons: data.coupons,
          testimonials: data.testimonials,
          deleteFlag: data.deleteFlag
        });
      })
      .catch(error => {
        console.error('Error fetching user privileges:', error);
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
    setOpenDialog(true);
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
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">User Management</h2>
          <p className="text-slate-500 mt-1">Manage user accounts, roles, and access privileges</p>
        </div>
      </div>

      {/* User Form Section */}
      <Card className="mb-8 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 bg-white overflow-hidden transition-all duration-300">
        <UserForm user={selectedUser} onSubmit={handleSubmit} />
      </Card>

      {/* Search Bar */}
      <Box className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-slate-100/50">
        <div className="flex gap-2">
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
              className="whitespace-nowrap border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Clear
            </Button>
          )}
        </div>
      </Box>

      {/* Data Table */}
      <Paper className="shadow-2xl shadow-slate-200/30 rounded-3xl border border-slate-100 overflow-hidden bg-white">
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
                <div className="flex gap-1 items-center h-full">
                  {params.row.id === 1 ? (
                    <span className="text-slate-400 text-[11px] uppercase font-bold tracking-widest px-3 py-1 bg-slate-100 rounded-full">System Admin</span>
                  ) : (
                    <>
                      <IconButton onClick={() => handleEdit(params.row.id)} color="primary" size="small" title="Edit" className="hover:bg-sky-50 transition-colors">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleOpenPrivileges(params.row.id)} color="secondary" size="small" title="Privileges" className="hover:bg-purple-50 transition-colors">
                        <VpnKeyIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small" title="Delete" className="hover:bg-red-50 transition-colors">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </div>
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

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm" PaperProps={{ className: "rounded-3xl" }}>
        <DialogTitle className="font-bold border-b border-slate-100 pb-4 bg-slate-50 text-slate-800">
          User Privileges Details
        </DialogTitle>
        <DialogContent className="pt-8 pb-6">
          <FormGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(privileges)
              .map(([moduleName, isChecked]) => (
                moduleName !== "id" && moduleName !== "userId" && moduleName !== "deleteFlag" ?
                  <div key={moduleName} className="bg-white border border-slate-200 rounded-xl p-2 hover:bg-slate-50 hover:border-sky-200 transition-all duration-300">
                    <FormControlLabel
                      className="m-0 w-full"
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(moduleName)}
                          color="primary"
                          className="text-slate-400"
                        />
                      }
                      label={<span className="font-semibold text-slate-700 capitalize text-sm">{moduleName}</span>}
                    />
                  </div>
                  : ""
              ))}
          </FormGroup>
        </DialogContent>
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
          <Button onClick={handleCloseDialog} color="inherit" className="font-bold text-slate-500 hover:bg-slate-200 rounded-xl px-6">
            Cancel
          </Button>
          <Button onClick={handleSavePrivileges} color="primary" variant="contained" className="font-bold bg-sky-600 hover:bg-sky-700 rounded-xl px-6 shadow-md shadow-sky-200 flex-shrink-0">
            Save Privileges
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default UserManagement;
