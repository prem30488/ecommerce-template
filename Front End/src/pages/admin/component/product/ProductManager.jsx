import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  FormGroup,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddOrEditProduct from './AddOrEditProduct';
import Alert from 'react-s-alert';
import {
  addProduct, getProducts, deleteProduct, undeleteProduct, fetchProductById, getCategories, updateProduct,
  getForms, getOffersByProductId, getAllOffers, addOffer, deleteOffer
} from '../../../../util/APIUtils';


import { getCurrentDate } from '../../../../util/util';

function ProductManager() {



  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const reloadProductList = () => {
    getProducts(page, pageSize)
      .then((res) => {
        setProducts(res.content);
        setTotalElements(res.totalElements);
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
  }
  const [products, setProducts] = useState([]);

  const [offers, setOffers] = useState([]);
  const reloadOffersList = () => {
    getAllOffers(0, 100)
      .then(res => {
        setOffers(res.content)
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
  }

  const reloadCategoriesList = () => {
    getCategories(0, 100)
      .then((resCat) => {
        let resultCat = [];
        resCat.content.map((cat) => {
          resultCat.push({ id: cat.id, title: cat.title });
        })

        setCategories(resultCat);

      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
  }

  const reloadFormsList = () => {
    getForms(0, 100)
      .then((resForm) => {
        let resultForm = [];
        resForm.content.map((fo) => {
          resultForm.push({ id: fo.id, title: fo.title });
          // console.log("result :" + JSON.stringify(result))
        })

        setForms(resultForm);

      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
  }

  const [categories, setCategories] = useState([]);
  const [forms, setForms] = useState([]);


  useEffect(() => {
    reloadProductList();
    reloadCategoriesList();
    reloadFormsList();
    reloadOffersList();
  }, [page, pageSize]);

  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [isAddOfferDialogOpen, setAddOfferDialogOpen] = useState(false);
  const [isPDialogOpen, setIsPDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [discount, setDiscount] = useState(0);
  const [buy, setBuy] = useState(0);
  const [buyget, setBuyget] = useState(0);
  const [size, setSize] = useState("S");
  const [type, setType] = useState(0);
  const [freeProduct, setFreeProduct] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('lg');
  const [freeProductid, setFreeProductid] = useState(1);
  const [freeProducttitle, setFreeProducttitle] = useState('');
  const [freeProductsize, setFreeProductsize] = useState('S');
  const columns = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'title', headerName: 'Name', width: 200 },
    {
      field: 'categories',
      headerName: 'Categories',
      width: 180,
      renderCell: (params) => (
        <div>
          {categories && categories.length > 0 && params.row.categories && params.row.categories.length > 0 ? params.row.categories.map((categoryId) =>

            <span key={categoryId.id}>
              {categories.find((category) => category.id === categoryId.id).title}
              <br />
            </span>
          ) : ""}
        </div>
      ),
    },
    {
      field: 'audience',
      headerName: 'Genders',
      width: 150,
      renderCell: (params) => (
        <div>
          {params.row.audience ? params.row.audience.split(', ').map((gender) => (
            <span key={gender}>
              {gender}
              <br />
            </span>
          ))
            : ""}
        </div>
      ),
    },
    { field: 'stock', headerName: 'Stock', width: 150 },
    {
      field: 'active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Switch
              checked={params.row.active}
              onChange={() => handleToggleActive(params.row.id)}
            />
          }
          label={params.row.active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 400,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenAddOfferDialog(params.row.id)}
          >
            Add Offer
          </Button>
          {params.row.active && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewOffers(params.row.id)}
              >
                View Offers
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleEditProduct(params.row)}
              >
                Edit
              </Button>
            </>
          )}

        </div>
      ),
    },
  ];

  // Function to open the edit product form
  const handleEditProduct = product => {

    product.catIds = [];

    if (product.categories && product.categories.length > 0) {
      product.categories.map(cat =>
        product.catIds.push(cat.id)
      );
      //console.log(product.catIds);
    } else {
      //product.categories = [1];
      product.catIds = [1];
    }
    if (!product.form || !product.form.id) {
      product.form = 1;
    } else {
      product.formId = product.form.id;
      product.form = product.formId;
    }
    setEditingProduct(product);
    setIsPDialogOpen(true);
  };

  // Function to close the edit product form
  const handleCloseEditForm = () => {
    setEditingProduct(null);
    setIsPDialogOpen(false);
  }
  const handleSaveEditForm = (editedProduct) => {
    let cid = "", fid = 1;
    if (undefined !== editedProduct.catIds) {
      cid = editedProduct.catIds.join(",");
    }
    editedProduct.categories = [];

    if (undefined !== editedProduct.formId) {
      fid = editedProduct.formId;
    }
    editedProduct.form = null;
    let product = JSON.parse(JSON.stringify(editedProduct));
    product.catIds = cid;
    product.formId = fid;
    console.log(product);
    if (product && product.id !== 0) {
      product.id = editingProduct.id;
      updateProduct(product).then(res => {
        Alert.success("Success!");
        reloadProductList();
        setEditingProduct(null);
        setIsPDialogOpen(false);
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
    }
    else if (product.id === 0) {
      addProduct(product).then(res => {
        Alert.success("Success!");
        reloadProductList();
        setEditingProduct(null);
        setIsPDialogOpen(false);
      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
    }
  };

  const handleToggleActive = (productId) => {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, active: !product.active } : product
    );


    fetchProductById(productId).then(res => {
      let item = res;
      if (item) {
        if (item.active === true) {
          deleteProduct(item).then(res => {
            Alert.success("Success!");
            reloadProductList();
          }).catch(error => {
            Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
          });
        } else {
          undeleteProduct(item).then(res => {
            Alert.success("Success!");
            reloadProductList();
          }).catch(error => {
            Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
          });
        }
      }

    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
    // setProducts(updatedProducts);

  };

  const handleOpenAddOfferDialog = (productId) => {
    setCurrentProductId(productId);
    setAddOfferDialogOpen(true);
  };

  const handleCloseAddOfferDialog = () => {
    setCurrentProductId(null);
    setAddOfferDialogOpen(false);
    clearOfferForm();
  };

  const clearOfferForm = () => {
    setStartDate('');
    setEndDate('');
    setDiscount('');
  };

  const handleAddOffer = () => {
    if (currentProductId === null) return;

    const newOffer = {
      "productId": currentProductId,
      "from": startDate,
      "to": endDate,
      "discount": Number(discount),
      "buy": Number(buy),
      "buyget": Number(buyget),
      "active": true,
      "size": size,
      "type": type,
      "freeProductid": freeProductid,
      "freeProducttitle": products.find((product) => product.id === freeProductid).title,
      "freeProductsize": freeProductsize,
    };
    addOffer(newOffer).then((res) => {
      Alert.success("Success!");
      reloadOffersList();
      handleCloseAddOfferDialog();
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const currentProduct = products.find((product) => product.id === currentProductId);

  const [viewingOffers, setViewingOffers] = useState(null);

  const handleViewOffers = (productId) => {
    reloadOffersList();
    setViewingOffers(productId);
    setCurrentProductId(productId);
  };

  const handleCloseViewOffers = () => {
    setViewingOffers(null);
  };



  const handleAddProduct = () => {
    const initialProduct = {
      "title": '',
      "active": false,
      "categories": [1],
      "audience": 'Men',
      "stock": 0,
      "bestseller": false,
      "featured": false,
      "rating": "",
      "form": 1,
      "catIds": [1],
      "formId": 1,
      "description": '',
      "hmsCode": '',
      "unit": "days",
      "unitSmall": 0,
      "unitMedium": 0,
      "unitLarge": 0,
      "price": 0,
      "priceMedium": 0,
      "priceLarge": 0
    };
    setEditingProduct(initialProduct);
    setIsPDialogOpen(true);
  };

  const handleAddSaveProduct = (newProduct) => {
    // Add the new product to the products array
    setProducts([...products, newProduct]);
    setIsPDialogOpen(false);
  };

  const handleDeleteOffer = (id) => {
    deleteOffer(id).then((res) => {
      Alert.success("Success!");
      reloadOffersList();
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });

  };

  const handlePageSizeChange = (params) => {
    setPageSize(params.pageSize);
  };

  const handlePageChange = (params) => {
    setPage(params.page);
  };

  return (
    <div>
      <div style={{ height: 500, width: '100%' }}>
        <Button variant="contained" color="primary" onClick={handleAddProduct} >Add New Product</Button>
        <DataGrid
          rows={products}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: pageSize, page: page },
            },
          }}
          onPaginationModelChange={(model) => {
            setPageSize(model.pageSize);
            setPage(model.page);
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          pagination
          rowCount={totalElements}
          paginationMode="server"
        />
      </div>
      <Dialog open={isPDialogOpen} onClose={handleCloseEditForm}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <AddOrEditProduct
            product={editingProduct}
            categories={categories}
            forms={forms}
            onSave={(editedProduct) => {
              // Update the product in your state with the editedProduct data
              // You can handle product updates here
              handleSaveEditForm(editedProduct); // Close the dialog
            }}
            onCancel={handleCloseEditForm}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditForm} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isAddOfferDialogOpen} onClose={handleCloseAddOfferDialog} fullWidth={fullWidth}
        maxWidth={maxWidth}>
        <DialogTitle>Add Offer for {currentProduct ? currentProduct.title : ''}</DialogTitle>
        <DialogContent>
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


          <TextField
            label="Discount (%)"
            value={discount || 0}
            onChange={(e) => setDiscount(e.target.value)}
            type="number"
            required
          />
          Or
          <TextField
            label="Buy Qty"
            value={buy || 0}
            onChange={(e) => setBuy(e.target.value)}
            type="number"
          />
          <TextField
            label="Get Qty"
            value={buyget || 0}
            onChange={(e) => setBuyget(e.target.value)}
            type="number"
          />
          <InputLabel>Size</InputLabel>
          <Select
            name="size"
            value={size || 'S'}
            onChange={(e) => setSize(e.target.value)}
          >
            <MenuItem key="0" value="S"         >
              Small
            </MenuItem>
            <MenuItem key="1" value="M"         >
              Medium
            </MenuItem>
            <MenuItem key="2" value="L"         >
              Large
            </MenuItem>
          </Select>
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={type || 0}
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem key="3" value="0"         >
              Flat x% off on selected product's selected size
            </MenuItem>
            <MenuItem key="4" value="1"         >
              Buy x units get y units free, Example, buy 2 get 1 free
            </MenuItem>
            <MenuItem key="5" value="2"         >
              Buy 1 item get same or another item's pack free, Exaple Buy bat get ball free
            </MenuItem>
            <MenuItem key="6" value="3"         >
              Buy x thresold value quantity and get y % discount on billed amount, Example buy 5 qty get 30% discount free
            </MenuItem>
          </Select>
          <InputLabel>Product (Small) size</InputLabel>
          <Select
            name="freeProductid"
            value={freeProductid}
            onChange={(e) => setFreeProductid(e.target.value)}
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.title}
              </MenuItem>
            ))}
          </Select>

          <InputLabel>Size Free Product</InputLabel>
          <Select
            name="freeProductsize"
            value={freeProduct.size || 'S'}
            onChange={(e) => setFreeProductsize(e.target.value)}
          >
            <MenuItem key="10" value="S"         >
              Small
            </MenuItem>
            <MenuItem key="11" value="M"         >
              Medium
            </MenuItem>
            <MenuItem key="12" value="L"         >
              Large
            </MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddOfferDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddOffer} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      {viewingOffers !== null && (
        <Dialog open={true} onClose={handleCloseViewOffers}>
          <DialogTitle>Offers for {currentProduct ? currentProduct.title : ''}</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Discount (%)</TableCell>
                    <TableCell>Buy (Qty.)</TableCell>
                    <TableCell>Get (Qty.)</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers
                    .filter((offer) => offer.productId === viewingOffers)
                    .map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>{offer.from}</TableCell>
                        <TableCell>{offer.to}</TableCell>
                        <TableCell>{offer.discount}%</TableCell>
                        <TableCell>{offer.buy}</TableCell>
                        <TableCell>{offer.buyget}</TableCell>
                        <TableCell>{offer.size}</TableCell>
                        <TableCell>{offer.type}</TableCell>
                        <TableCell>{offer.active.toString()}</TableCell>
                        <TableCell>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDeleteOffer(offer.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewOffers} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default ProductManager;
