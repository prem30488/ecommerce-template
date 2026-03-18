// CouponManager.js
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import axios from 'axios';
import CouponForm from './CouponForm';
import Alert from 'react-s-alert';
import {getCoupons,deleteCoupon,undeleteCoupon,addCoupon,updateCoupon} from '../../../../util/APIUtils';
const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

const fetchCoupons = async () => {
    getCoupons(0,100)
    .then((res) => {
        setCoupons(res.content);
    }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');            
    });
  };
  fetchCoupons();

  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsFormOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleDeleteCoupon = async () => {
    if (selectedCoupon) {
      try {
        //await axios.delete(`/api/coupons/${selectedCoupon.id}`); // Replace with your API endpoint
        await deleteCoupon(selectedCoupon).then((res) => {
            Alert.success("Success!");
        }).catch(error => {
            Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');            
        });
        fetchCoupons();
        setSelectedCoupon(null);
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const handleUndeleteCoupon = async () => {
    if (selectedCoupon) {
      try {
        //await axios.put(`/api/coupons/undelete/${selectedCoupon.id}`); // Replace with your API endpoint
        await undeleteCoupon(selectedCoupon).then((res) => {
            Alert.success("Success!");
        }).catch(error => {
            Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');            
        });
        fetchCoupons();
        setSelectedCoupon(null);
      } catch (error) {
        console.error('Error undeleting coupon:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedCoupon) {
        //await axios.put(`/api/coupons/${selectedCoupon.id}`, formData); // Replace with your API endpoint
        await updateCoupon(formData)
        .then((res) => {
            Alert.success("Success!");
        }).catch(error => {
            Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');            
        });
      } else {
        //await axios.post('/api/coupons', formData); // Replace with your API endpoint
        await addCoupon(formData)
        .then((res) => {
            Alert.success("Success!");
        }).catch(error => {
            Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');            
        });
      }
      fetchCoupons();
      setSelectedCoupon(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleFormCancel = () => {
    setSelectedCoupon(null);
    setIsFormOpen(false);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'code', headerName: 'Coupon Code', width: 200 },
    { field: 'discount', headerName: 'Discount (%)', width: 150 },
    { field: 'from', headerName: 'From Date', width: 200 },
    { field: 'to', headerName: 'To Date', width: 200 },
    { field: 'deleteflag', headerName: 'Deleted?', width: 120 ,
        renderCell : (params) => (
            params.row.deleteFlag?params.row.deleteFlag.toString():""
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleEditCoupon(params.row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleAddCoupon}>
        Add Coupon
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDeleteCoupon}
        disabled={!selectedCoupon || selectedCoupon.deleteflag === 'inactive'}
      >
        Delete Coupon
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUndeleteCoupon}
        disabled={!selectedCoupon || selectedCoupon.deleteflag === 'active'}
      >
        Undelete Coupon
      </Button>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={coupons}
          columns={columns}
          pageSize={5}
          checkboxSelection
          onSelectionModelChange={(selection) => {
            const selectedId = selection.selectionModel[0];
            const selectedCoupon = coupons.find((c) => c.id === selectedId);
            setSelectedCoupon(selectedCoupon);
          }}
        />
      </div>
      {isFormOpen && (
        <CouponForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={selectedCoupon}
        />
      )}
    </div>
  );
};

export default CouponManager;
