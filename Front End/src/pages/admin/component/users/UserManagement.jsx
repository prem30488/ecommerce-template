import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import UserForm from './UserForm';
import { deleteUser, signup, getCurrentUser, getPrivileges, updatePrivileges } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import { getCurrentDate } from '../../../../util/util';
import {updateUser,getUserList,updateRole} from "../../../../util/APIUtils";
import { API_BASE_URL, ACCESS_TOKEN } from '../../../../constants';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
function UserManagement() {
  let flag = false;
  const initialUsers = [];
  const [selectedUser, setSelectedUser] = useState(null);
  const rowsPerPage = 10;
  const page = 0;
  const [totalElements, setTotalElements] = useState(0);
  const reloadUserList = () => {
    getUserList(page,rowsPerPage)
          .then((res) => {
              //this.setState({users: res.content, count: res.totalElements })
              setUsers(res.content);
              setTotalElements(res.totalElements);
          });
         // console.log("Users :"+JSON.stringify(users));
  }
 // reloadUserList();
  const [users, setUsers] = useState(initialUsers);

  const handleEdit = (id) => {
    const userToEdit = users.find((user) => user.id === id);
    setSelectedUser(userToEdit);
  };

  const handleDelete = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    setSelectedUser(null);
    deleteUser(id).then(res => {
      Alert.success("User deleted successfully.");
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
      sex : 'MALE',
      phoneNumber: formData.phoneNumber,
      premium:false,
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
          updateRole(selectedUser.id,formData.role)
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
      console.log('signUpRequest :' , signUpRequest);
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
    reloadUserList();
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
        console.log("privileges :"+ JSON.stringify(data));
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
    <div>
      <UserForm user={selectedUser} onSubmit={handleSubmit} />
      <br/>
      <DataGrid
        autoHeight
        rows={users}
        initialState={{
          pagination: {
            paginationModel: { pageSize: rowsPerPage, page: page },
          },
        }}
        pageSizeOptions={[rowsPerPage, 20, 50]}
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
            width: 150,
            renderCell: (params) => (
              <div>
                {params.row.id === 1 ? (
                  ''
                ) : (
                  <>
                    <button onClick={() => handleEdit(params.row.id)}>Edit</button> &nbsp;&nbsp;&nbsp;
                    <button onClick={() => handleDelete(params.row.id)}>Delete</button>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button onClick={() => handleOpenPrivileges(params.row.id)}>View Privileges</button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />
      
      <Dialog open={openDialog}  fullWidth>
        <DialogTitle>User Privileges</DialogTitle>
        <DialogContent>
          <FormGroup>
          {Object.entries(privileges)
          //.filter ( (o) => o !== 'id' && o!== ' userId')
          .map(([moduleName, isChecked]) => (              
              
            moduleName !== "id" && moduleName !== "userId" && moduleName !== "deleteFlag"?
              <FormControlLabel
                key={moduleName}
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(moduleName)}
                  />
                }
                label={moduleName}
              />
              :""
                            ))}
            
          </FormGroup>
          <Button onClick={handleSavePrivileges} color="primary" variant="contained">
            Save Privileges
          </Button>
          <Button onClick={handleCloseDialog} color="secondary" variant="contained">
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;
