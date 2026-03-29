import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, InputAdornment, Box, Typography } from '@mui/material';
import { Person, Email, VpnKey, Phone, Security, PersonAdd, Edit } from '@mui/icons-material';

function UserForm({ user, onSubmit }) {
  const [formData, setFormData] = useState({ username: '', email: '', role: 'user', password: 'changeme', phoneNumber: '' });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ username: '', email: '', role: 'user', password: '', phoneNumber: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ username: '', email: '', role: 'user', password: 'changeme', phoneNumber: '' });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="p-6 sm:p-8 w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
          {user ? <Edit /> : <PersonAdd />}
        </div>
        <Typography variant="h5" className="font-extrabold text-slate-800">
          {user ? 'Update Existing User' : 'Register New User'}
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TextField
          label="Username"
          name="username"
          variant="outlined"
          fullWidth
          value={formData.username}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person className="text-slate-400" />
              </InputAdornment>
            ),
            className: "bg-slate-50 border-slate-200"
          }}
        />

        <TextField
          label="Email Address"
          name="email"
          type="email"
          variant="outlined"
          fullWidth
          value={formData.email}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email className="text-slate-400" />
              </InputAdornment>
            ),
            className: "bg-slate-50"
          }}
        />

        <TextField
          label="Phone Number"
          name="phoneNumber"
          variant="outlined"
          fullWidth
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone className="text-slate-400" />
              </InputAdornment>
            ),
            className: "bg-slate-50"
          }}
        />

        <TextField
          select
          label="Account Role"
          name="role"
          variant="outlined"
          fullWidth
          value={formData.role || 'user'}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Security className="text-slate-400" />
              </InputAdornment>
            ),
            className: "bg-slate-50"
          }}
        >
          <MenuItem value="user">Standard User</MenuItem>
          <MenuItem value="admin">Administrator</MenuItem>
          <MenuItem value="superadmin">Superadmin</MenuItem>
        </TextField>

        <TextField
          label="Password (optional for update)"
          name="password"
          type="password"
          variant="outlined"
          fullWidth
          value={formData.password || ''}
          onChange={handleChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKey className="text-slate-400" />
              </InputAdornment>
            ),
            className: "bg-slate-50"
          }}
        />
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={user ? <Edit /> : <PersonAdd />}
          className="bg-sky-600 hover:bg-sky-700 font-bold px-8 shadow-md shadow-sky-200 rounded-xl py-3"
        >
          {user ? 'Save Changes' : 'Create User'}
        </Button>
      </div>
    </Box>
  );
}

export default UserForm;
