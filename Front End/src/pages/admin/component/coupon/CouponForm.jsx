// CouponForm.js
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from '@mui/material/Button';
import styled, { css, createGlobalStyle } from 'styled-components';

const CouponForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    id:0,
    from: new Date(),
    to: new Date(),
    discount : 0,
  });
  const [startDate, setStartDate] = useState(new Date(formData.from));
  const [endDate, setEndDate] = useState(new Date(formData.to));

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'code') {
      // Force alphanumeric (A-Z, 0-9) and no spaces
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formData.from = startDate;
    formData.to = endDate;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Coupon Code"
        variant="outlined"
        name="code"
        value={formData.code || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Discount (%)"
        variant="outlined"
        name="discount"
        type="number"
        value={formData.discount || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px' }}><small><strong>Valid From:</strong></small></div>
        <DatePicker
          style={{ width: '100%', padding: '8px' }}
          showTimeSelect
          wrapperClassName="datePickerFrom"
          dateFormat="MMMM d, yyyy h:mmaa"
          selected={startDate}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          onChange={date => setStartDate(date)}
        />
      </div>

      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div className="mb-2"><small><strong>Valid To:</strong></small></div>
        <DatePicker
          className='form-control form-control-solid w-100 '
          showTimeSelect
          wrapperClassName="datePickerFrom"
          dateFormat="MMMM d, yyyy h:mmaa"
          selected={endDate}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          onChange={date => setEndDate(date)}
        />
      </div>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Save Coupon
        </Button>
      </Box>
    </form>
  );
};

export default CouponForm;
