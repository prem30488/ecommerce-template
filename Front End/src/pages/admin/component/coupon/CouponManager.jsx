// CouponManager.js
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import { TextField, Box, TablePagination, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import CouponForm from './CouponForm';
import Alert from 'react-s-alert';
import { getCoupons, deleteCoupon, undeleteCoupon, addCoupon, updateCoupon } from '../../../../util/APIUtils';
const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCouponsData = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getCoupons(page, rowsPerPage, search);
      setCoupons(res.content || []);
      setTotalCount(res.totalElements || 0);
    } catch (error) {
      Alert.error((error && error.message) || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsData(0, searchQuery);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchCouponsData(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchCouponsData(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchCouponsData(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    fetchCouponsData(0, searchQuery);
  };

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
        fetchCouponsData(currentPage, searchQuery);
        setSelectedCoupon(null);
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  const handleUndeleteCoupon = async (couponToUndelete) => {
    const target = couponToUndelete || selectedCoupon;
    if (target) {
      try {
        await undeleteCoupon(target).then((res) => {
          Alert.success("Coupon activated!");
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
        fetchCouponsData(currentPage, searchQuery);
        setSelectedCoupon(null);
      } catch (error) {
        console.error('Error undeleting coupon:', error);
      }
    }
  };

  const handleToggleStatus = (params) => {
    if (params.row.deleteFlag) {
      handleUndeleteCoupon(params.row);
    } else {
      // Confirm before deactivating? For consistency with products, maybe just do it.
      const target = params.row;
      deleteCoupon(target).then((res) => {
        Alert.success("Coupon deactivated!");
        fetchCouponsData(currentPage, searchQuery);
      }).catch(error => {
        Alert.error((error && error.message) || 'Failed to deactivate coupon.');
      });
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
      fetchCouponsData(currentPage, searchQuery);
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
    {
      field: 'from',
      headerName: 'Valid From',
      width: 180,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'to',
      headerName: 'Valid To',
      width: 180,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleString() : 'N/A'
    },
    {
      field: 'deleteflag', headerName: 'Status', width: 150,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Switch
              checked={!params.row.deleteFlag}
              onChange={() => handleToggleStatus(params)}
              color="primary"
            />
          }
          label={!params.row.deleteFlag ? "Active" : "Inactive"}
        />
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
        {/* <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>Coupon Management</Typography> */}
      </Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
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
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by code/title/description..."
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

      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={coupons}
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
          checkboxSelection
          onRowSelectionModelChange={(newRowSelectionModel) => {
            const selectedId = newRowSelectionModel[0];
            const selectedCoupon = coupons.find((c) => c.id === selectedId);
            setSelectedCoupon(selectedCoupon);
          }}
        />
      </div>

      <Dialog open={isFormOpen} onClose={handleFormCancel} fullWidth maxWidth="sm">
        <DialogTitle>{selectedCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
        <DialogContent>
          <CouponForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={selectedCoupon}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CouponManager;
