import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { getCategories, addCategory, fetchCategoryById, updateCategory , deleteCategory} from '../../../../util/APIUtils';
import Alert from 'react-s-alert';
import { getCurrentDate } from '../../../../util/util';
function CategoryManager() {
  const rowsPerPage = 100;
  const page = 0;
  const [totalElements, setTotalElements] = useState(0);
  const reloadCategoriesList = () => {
    getCategories(page,rowsPerPage)
  .then((res) => {
      setCategories(res.content);
      setTotalElements(res.totalElements);
  });
  }
  const [categories, setCategories] = useState([]);
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState(1);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [ editType, setEditType] = useState(1);
  
  reloadCategoriesList();
  const handleAddCategory = () => {
    const newId = categories.length + 1;
    const newCategory = { id: newId,title, type, order: newId,description : "" };
    setCategories([...categories, newCategory]);
    const categoryObj = { title : title, type : type, order: newId, description : ' ', createdAt : getCurrentDate('-') };
    console.log("categoryObj :"+ JSON.stringify(categoryObj));
    addCategory(categoryObj).then(res => {
      console.log(JSON.stringify(res));
      Alert.success("Success!");
      setTitle('');
      setType(1);
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
      if(cat){
        cat.description = "''";
        cat.title = editTitle;
        cat.type = editType;
        cat.updatedAt = getCurrentDate('-');
        updateCategory(cat).then(res => {
          Alert.success("Success!");
          setEditCategoryId(null);
          setEditTitle('');
          setEditType(1);
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
    let prev = categories.findIndex((category) => category.order === order-1);
    let next = categories.findIndex((category) => category.order === order+1);
    
    let catPrev = updatedCategories[prev];
    let catNext = updatedCategories[next];
    updatedCategories.splice(index, 1);
    if (direction === 'up') {
      if(cat.order>1){
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
      if(cat.order < categories.length){
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
        }).catch(error => {
          Alert.error((error && error.message) || 'Oops! Something went wrong. Please try again!');            
        });
    
    reloadCategoriesList();
    //setCategories(updatedCategories);
   
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', width: 200 ,renderCell: (params) =>
    editCategoryId === params.row.id ? (
      <TextField
        value={editTitle}
       onChange={(e) => setEditTitle(e.target.value)}
      />
    ) : (
      params.row.title
    ),},
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
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={categories}
          columns={columns}
          checkboxSelection={false}
          totalElements={totalElements}
          autoPageSize={true}
          rowsPerPage = {rowsPerPage}
        />
      </div>
    </div>
  );
}

export default CategoryManager;
