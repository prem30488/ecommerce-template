import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Box,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { getCategories, addCategory, fetchCategoryById, updateCategory, deleteCategory } from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import { getCurrentDate } from '../../../../util/util';
function CategoryManager() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCategoriesList = async (page = 0, search = '') => {
    setLoading(true);
    try {
      const res = await getCategories(page, rowsPerPage, search);
      setCategories(res.content || []);
      setTotalCount(res.totalElements || 0);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState('');
  const [type, setType] = useState(1);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState(1);

  useEffect(() => {
    fetchCategoriesList(0, searchQuery);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(0);
    fetchCategoriesList(0, query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(0);
    fetchCategoriesList(0, '');
  };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
    fetchCategoriesList(newPage, searchQuery);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
    fetchCategoriesList(0, searchQuery);
  };

  const handleAddCategory = () => {
    const newId = categories.length + 1;
    const categoryObj = { title: title, type: type, order: newId, description: ' ', createdAt: getCurrentDate('-') };
    console.log("categoryObj :" + JSON.stringify(categoryObj));
    addCategory(categoryObj).then(res => {
      console.log(JSON.stringify(res));
      Alert.success("Success!");
      setTitle('');
      setType(1);
      fetchCategoriesList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleEditCategory = (id) => {
    const categoryToEdit = categories.find((category) => category.id === id);
    if (categoryToEdit) {
      setEditCategoryId(id);
      setEditTitle(categoryToEdit.title);
      setEditType(categoryToEdit.type);
    }
  };

  const handleSaveEdit = () => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === editCategoryId
          ? { ...category, title: editTitle, type: editType }
          : category
      )
    );

    fetchCategoryById(editCategoryId).then(res => {
      let cat = res;
      if (cat) {
        cat.description = "''";
        cat.title = editTitle;
        cat.type = editType;
        cat.updatedAt = getCurrentDate('-');
        updateCategory(cat).then(res => {
          Alert.success("Success!");
          setEditCategoryId(null);
          setEditTitle('');
          setEditType(1);
          fetchCategoriesList(currentPage, searchQuery);
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      }
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });


  };
  const handleCancelSaveEdit = () => {
    setEditCategoryId(null);
    setEditTitle(editTitle);
    setEditType(editType);
  }
  const handleDeleteCategory = (id) => {
    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== id)
    );
    deleteCategory(id).then(res => {
      Alert.success("Success!");
      fetchCategoriesList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });
  };

  const handleMoveCategory = (id, direction) => {
    const index = categories.findIndex((category) => category.id === id);
    const updatedCategories = [...categories];
    const movedCategory = updatedCategories[index];
    let cat = updatedCategories[index];
    let order = cat.order;
    let prev = categories.findIndex((category) => category.order === order - 1);
    let next = categories.findIndex((category) => category.order === order + 1);

    let catPrev = updatedCategories[prev];
    let catNext = updatedCategories[next];
    updatedCategories.splice(index, 1);
    if (direction === 'up') {
      if (cat.order > 1) {
        catPrev.order = cat.order;
        cat.order = cat.order - 1;
      }
      updateCategory(catPrev).then(res => {

      }).catch(error => {
        Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
      });
      //console.log("up : " + JSON.stringify(cat));
      updatedCategories.splice(index - 1, 0, movedCategory);

    } else if (direction === 'down') {
      if (cat.order < categories.length) {
        catNext.order = cat.order;
        cat.order = cat.order + 1;
        updateCategory(catNext).then(res => {

        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
        });
      }
      //console.log("down : " + JSON.stringify(movedCategory));
      updatedCategories.splice(index + 1, 0, movedCategory);
    }


    // Reorder the categories
    // updatedCategories.forEach((category, index) => {
    //   category.order = index + 1;
    // });
    updateCategory(cat).then(res => {
      Alert.success("Success!");
      fetchCategoriesList(currentPage, searchQuery);
    }).catch(error => {
      Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');
    });


    //setCategories(updatedCategories);

  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'title', headerName: 'Title', width: 200, renderCell: (params) =>
        editCategoryId === params.row.id ? (
          <TextField
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
        ) : (
          params.row.title
        ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) =>
        editCategoryId === params.row.id ? (
          <FormControl variant="outlined">
            <InputLabel>Type</InputLabel>
            <Select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              label="Type"
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
          </FormControl>
        ) : (
          params.row.type
        ),
    },
    { field: 'order', headerName: 'Display Order', width: 95 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 500,
      renderCell: (params) =>
        editCategoryId === params.row.id ? (
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelSaveEdit}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleMoveCategory(params.row.id, 'up')}
            >
              Up
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleMoveCategory(params.row.id, 'down')}
            >
              Down
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleEditCategory(params.row.id)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleDeleteCategory(params.row.id)}
            >
              Delete
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div>

      <div>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <FormControl variant="outlined">
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            label="Type"
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </div>

      <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title..."
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
          rows={categories}
          columns={columns}
          checkboxSelection={false}
          rowCount={totalCount}
          loading={loading}
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
        />
      </div>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}


export default CategoryManager;
