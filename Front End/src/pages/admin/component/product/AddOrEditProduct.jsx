import React, { useState } from 'react';
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
} from '@mui/material';
import FileUploader from './FileUploader';

function AddOrEditProduct({ product, categories,forms, onSave, onCancel }) {
  const [formData, setFormData] = useState(product);
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if(name === "form"){
      formData.formId = formData.form;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formData.formId = formData.form;
    if(product.id && product.id!==0){
      formData.id = product.id;
    }else{
      formData.id = 0;
    }
    onSave(formData);
  };

  const handleCategoryChange = (event) => {
    formData.catIds = event.target.value;
  };

  const handleCheckboxChange = (value) => {

    if(formData.audience.length > 2 && !formData.audience.includes(value.toString().trim())){
    formData.audience=formData.audience+","+value.toString();
    }else{
      formData.audience=value.toString();
    }
  };
  
  let index=0;
  const returnFileArray = (fileURL) => {
   
    if(index==0 && fileURL === 'removeAll' || formData.imageURLs === null){
      formData.imageURLs='';
    }
    console.log("parent :"+JSON.stringify(fileURL));
    
    if(index<5 && fileURL !== 'removeAll'){
      formData.imageURLs = formData.imageURLs + fileURL;
      if(index<4){
        formData.imageURLs += ",";
      }
      index++;
    }
   
  }

  return (
    <div>
      <h2>{product && product.id && product.id !==  null && formData ? 'Edit Product' : 'Add Product'}</h2>
      <br/>
      {/* <p>
        {JSON.stringify(formData)}
      </p> */}
      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          label="name"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <TextField
          name="price"
          label="Price (INR)"
          value={formData.price}
          onChange={handleChange}
          type="number"
          required
        />
        <TextField
          name="stock"
          label="Stock Qty"
          value={formData.stock}
          onChange={handleChange}
          type="number"
          required
        />
        <FormGroup>
        <FormControl>
        
         <InputLabel>Form</InputLabel>
          <Select
            name="form"
            value={formData.form}
            onChange={handleChange}
          >
           
            {forms.map((form) => (
              form?
              <MenuItem key={form.id} value={form.id}>
                {form.title}
              </MenuItem>
              : ""
            ))}
          </Select>
        </FormControl>
        
        <FormControl>
        
         <InputLabel>Categories</InputLabel>
          <Select
            multiple
            name="categories"
            value={formData.catIds}
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              category?
              <MenuItem key={category.id} value={category.id} 
              >
                {category.title}
              </MenuItem>
              : ""
            ))}
          </Select>
        </FormControl>
        </FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              name="bestseller"
              checked={formData.bestseller}
              onChange={handleChange}
            />
          }
          label="Bestseller"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
          }
          label="Featured"
        />
         <TextField
          name="rating"
          label="Rating (5/5)"
          value={formData.rating}
          onChange={handleChange}
          required
        />
        <TextField
          name="hmsCode"
          label="HSN Code"
          value={formData.hmsCode}
          onChange={handleChange}
          required
        />

        
        <TextField
          name="priceMedium"
          label="Price Medium (INR)"
          value={formData.priceMedium}
          onChange={handleChange}
          required
          type="Number"
        />
        <TextField
          name="unitMedium"
          label="Unit Medium"
          value={formData.unitMedium}
          onChange={handleChange}
          required
          type="Number"
        />
        <TextField
        name="priceLarge"
        label="Price Large (INR)"
        value={formData.priceLarge}
        onChange={handleChange}
        required
        type="Number"
      />
      
      <TextField
          name="unitLarge"
          label="Unit Large"
          value={formData.unitLarge}
          onChange={handleChange}
          required
          type="Number"
        />
        <TextField
          name="unitSmall"
          label="Unit Small"
          value={formData.unitSmall}
          onChange={handleChange}
          required
          type="Number"
        />
        <InputLabel>Unit</InputLabel>
         <Select
           name="unit"
           value={formData.unit}
           onChange={handleChange}
         >
            <MenuItem key="0" value="days"         >
               days
             </MenuItem>
             <MenuItem key="1" value="ml"         >
               ml
             </MenuItem>
             <MenuItem key="2" value="grams"         >
               grams
             </MenuItem>
             <MenuItem key="3" value="kg"         >
               kg
             </MenuItem>
             <MenuItem key="4" value="Capsules"         >
             Capsules
             </MenuItem>
             <MenuItem key="5" value="Gummies"         >
             Gummies
             </MenuItem>
             <MenuItem key="6" value="mg"         >
             mg
             </MenuItem>
         </Select>
       
        
        <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.audience.includes('Men')}
            onChange={() => handleCheckboxChange('Men')}
          />
        }
        label="Men"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.audience.includes('Women')}
            onChange={() => handleCheckboxChange('Women')}
          />
        }
        label="Women"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.audience.includes('Kids')}
            onChange={() => handleCheckboxChange('Kids')}
          />
        }
        label="Kids"
      />
    </FormGroup>
    {
    
      <div>
        {formData.imageURLs !== undefined && formData.imageURLs !== null && formData.imageURLs.split(",").map((imag, index) => 
        index<5?
        <img src ={imag} style = {{width:"100px",height:"100px"}} /> : ""
              )
        }
      </div>
     
    }
        <FileUploader maxNoFiles={5} onSave = {returnFileArray} />
        <br/>
        <Button type="submit" variant="contained" color="primary">
          {product && product.id && product.id!==0 ? 'Update' : 'Add'}
        </Button>
        <Button variant="contained" color="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </form>
    </div>
  );
}

export default AddOrEditProduct;
