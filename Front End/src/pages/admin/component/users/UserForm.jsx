import React, { useState, useEffect } from 'react';

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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        type="text"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="superadmin">Superadmin</option>
      </select>
      <input
        type="text"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <input
        type="text"
        name="phoneNumber"
        placeholder="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
      />
      <button type="submit">{user ? 'Update' : 'Insert'}</button>
    </form>
  );
}

export default UserForm;
