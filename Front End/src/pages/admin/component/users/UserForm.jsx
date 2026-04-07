import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, InputAdornment, Box, Typography, Grid } from '@mui/material';
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
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 4 }, w: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
          {user ? <Edit /> : <PersonAdd />}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
          {user ? 'Update Existing User' : 'Register New User'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
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
                  <Person sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
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
                  <Email sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
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
                  <Phone sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
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
                  <Security sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="user">Standard User</MenuItem>
            <MenuItem value="admin">Administrator</MenuItem>
            <MenuItem value="superadmin">Superadmin</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
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
                  <VpnKey sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={user ? <Edit /> : <PersonAdd />}
          sx={{ fontWeight: 'bold', px: 4, borderRadius: 3, py: 1.5 }}
        >
          {user ? 'Save Changes' : 'Create User'}
        </Button>
      </Box>
    </Box>
  );
}

export default UserForm;
