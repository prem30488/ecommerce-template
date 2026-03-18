// CouponForm.js
import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
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
    const { name, value } = e.target;
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
        label="Discount (%)"
        variant="outlined"
        name="discount"
        type="number"
        value={formData.discount || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <DatePicker
      className='form-control form-control-solid w-250px '
 showTimeSelect
 wrapperClassName="datePickerFrom"
 dateFormat="MMMM d, yyyy h:mmaa"
 selected={startDate}
 selectsStart
 startDate={startDate}
 endDate={endDate}
 onChange={date => setStartDate(date)}
/>
<DatePicker
className='form-control form-control-solid w-250px '
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
    
      <Button variant="contained" color="primary" type="submit">
        Save
      </Button>
      <Button variant="contained" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
};

export default CouponForm;
