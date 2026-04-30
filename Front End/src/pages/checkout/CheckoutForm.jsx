import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css'; // Import your CSS file for styling
import { ShopContext } from '../../context/shop-context';
import { useContext } from 'react';
import Alert from 'react-s-alert';
import { API_BASE_URL } from '../../constants/index';
import { createOrder } from '../../util/APIUtils';
import LocationPicker from '../../components/maps/LocationPicker';

const CheckoutForm = ({subTotal,total,callbackFn}) => {
  const navigate = useNavigate();
  const { addToCustomerData, cartItems,martItems,lartItems,freeCartItems,freeMartItems,freeLartItems } = useContext(ShopContext);
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      mobileNumber: '',
      billingAddress: {
        street: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        type: 'billing',
      },
      shippingAddress: {
        street: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        type: 'shipping',
      },
      paymentType: 'UPI',
      sameAddress: false,
      subTotal: subTotal,
      total: total,
      cartItems : cartItems,
      martItems : martItems,
      lartItems : lartItems,
      freeCartItems : freeCartItems,
      freeMartItems : freeMartItems,
      freeLartItems : freeLartItems,
      latitude: null,
      longitude: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      mobileNumber: Yup.string()
        .matches(/^\d+$/, 'Mobile Number must only contain digits')
        .required('Mobile Number is required'),
      billingAddress: Yup.object().shape({
        street: Yup.string().required('Street is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        country: Yup.string().required('Country is required'),
        zipcode: Yup.string()
          .matches(/^\d+$/, 'ZIP Code must only contain digits')
          .required('ZIP Code is required'),
        type: Yup.string().required('Address Type is required'),
      }),
      shippingAddress: Yup.object().when('sameAddress', {
        is: false,
        then: () => Yup.object().shape({
          street: Yup.string().required('Street is required'),
          city: Yup.string().required('City is required'),
          state: Yup.string().required('State is required'),
          country: Yup.string().required('Country is required'),
          zipcode: Yup.string()
            .matches(/^\d+$/, 'ZIP Code must only contain digits')
            .required('ZIP Code is required'),
          type: Yup.string().required('Address Type is required'),
        }),
      }),
      paymentType: Yup.string().required('Payment Type is required'),
    }),
    onSubmit: async (values) => {
      // Handle form submission
      console.log('Form submitted:', values);
      addToCustomerData(values);
        try{
              // Adjust the URL based on your actual API endpoint
              // Make a request using APIUtils
              const response = await createOrder(values);
          
              // Handle the response as needed
              //console.log('Response:', response.data);
              //console.log('Response id:', response.data.id);
              Alert.success("Success!");
              callbackFn(response.id);
              // Replace the following line with your navigation logic
              //navigate('/previewInvoice'); // Navigate to the success page
        }catch (error) {
          // Handle errors
          console.error('Error:', error.message);
          Alert.error(error.message || 'Oops! Some error occurred!');
        }
      },
  });

  const handleSameAddressChange = () => {
    if (formik.values.sameAddress) {
      formik.setValues((prevValues) => ({
        ...prevValues,
        shippingAddress: { ...prevValues.billingAddress },
      }));
    }
  };

  const handleLocationSelect = (location) => {
    // Update Formik fields with the data from the map
    if (location.street) formik.setFieldValue('shippingAddress.street', location.street);
    if (location.city) formik.setFieldValue('shippingAddress.city', location.city);
    if (location.state) formik.setFieldValue('shippingAddress.state', location.state);
    if (location.zipcode) formik.setFieldValue('shippingAddress.zipcode', location.zipcode);
    
    // Also update billing address if "sameAddress" is true
    if (formik.values.sameAddress) {
        if (location.street) formik.setFieldValue('billingAddress.street', location.street);
        if (location.city) formik.setFieldValue('billingAddress.city', location.city);
        if (location.state) formik.setFieldValue('billingAddress.state', location.state);
        if (location.zipcode) formik.setFieldValue('billingAddress.zipcode', location.zipcode);
    }

    // Store coordinates
    formik.setFieldValue('latitude', location.lat);
    formik.setFieldValue('longitude', location.lng);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="checkout-form">
      {/* Name */}
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          className={formik.touched.name && formik.errors.name ? 'error' : ''}
        />
        {formik.touched.name && formik.errors.name && (
          <div className="error-message">{formik.errors.name}</div>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className={formik.touched.email && formik.errors.email ? 'error' : ''}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="error-message">{formik.errors.email}</div>
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="number"
          id="mobileNumber"
          name="mobileNumber"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.mobileNumber}
          className={formik.touched.mobileNumber && formik.errors.mobileNumber ? 'error' : ''}
        />
        {formik.touched.mobileNumber && formik.errors.mobileNumber && (
          <div className="error-message">{formik.errors.mobileNumber}</div>
        )}
      </div>

      {/* Billing Address */}
      <div className="address-section">
        <label>Billing Address:</label>
        <div>
          <label htmlFor="billingStreet">Street:</label>
          <input
            type="text"
            id="billingStreet"
            name="billingAddress.street"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.billingAddress.street}
            className={
              formik.touched.billingAddress?.street && formik.errors.billingAddress?.street
                ? 'error'
                : ''
            }
          />
          {formik.touched.billingAddress?.street && formik.errors.billingAddress?.street && (
            <div className="error-message">{formik.errors.billingAddress?.street}</div>
          )}
        </div>
        <div>
          <label htmlFor="billingAddressLine2">Apartment, suite, etc. (optional):</label>
          <input
            type="text"
            id="billingAddressLine2"
            name="billingAddress.addressLine2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.billingAddress.addressLine2}
          />
        </div>

        <div>
          <label htmlFor="billingCity">City:</label>
          <input
            type="text"
            id="billingCity"
            name="billingAddress.city"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.billingAddress.city}
          />
          {formik.touched.billingAddress?.city && formik.errors.billingAddress?.city && (
            <div className="error-message">{formik.errors.billingAddress?.city}</div>
          )}
        </div>


        <div>
          <label htmlFor="billingState">State:</label>
          <input
            type="text"
            id="billingState"
            name="billingAddress.state"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.billingAddress.state}
          />
          {formik.touched.billingAddress?.state && formik.errors.billingAddress?.state && (
            <div className="error-message">{formik.errors.billingAddress?.state}</div>
          )}
        </div>

        
        <div>
          <label htmlFor="billingCountry">Country:</label>
          <input
            type="text"
            id="billingCountry"
            name="billingAddress.country"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.billingAddress.country}
          />
          {formik.touched.billingAddress?.country && formik.errors.billingAddress?.country && (
            <div className="error-message">{formik.errors.billingAddress?.country}</div>
          )}
        </div>

        <div>
          <label htmlFor="billingZipCode">Zip Code:</label>
          <input
            type="number"
            id="billingZipCode"
            name="billingAddress.zipcode"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.billingAddress.zipcode}
          />
          {formik.touched.billingAddress?.zipcode && formik.errors.billingAddress?.zipcode && (
            <div className="error-message">{formik.errors.billingAddress?.zipcode}</div>
          )}
        </div>
        
        {/* ... (other billing address fields) */}
      </div>

      {/* Same Address Checkbox */}
      <div>
        <label>
          <input
            type="checkbox"
            name="sameAddress"
            checked={formik.values.sameAddress}
            onChange={(e) => {
              formik.handleChange(e);
              handleSameAddressChange();
            }}
          />
          Same Address
        </label>
      </div>

      {/* Shipping Address */}
      {/* {!formik.values.sameAddress && ( */}
      <div className="address-section">
        <label>Shipping Address:</label>
        <div style={{ marginBottom: '20px' }}>
          <LocationPicker onLocationSelect={handleLocationSelect} />
        </div>
          <div>
            <label htmlFor="shippingStreet">Street:</label>
            <input
              type="text"
              id="shippingStreet"
              name="shippingAddress.street"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shippingAddress.street}
              className={
                formik.touched.shippingAddress?.street && formik.errors.shippingAddress?.street
                  ? 'error'
                  : ''
              }
            />
            {formik.touched.shippingAddress?.street && formik.errors.shippingAddress?.street && (
              <div className="error-message">{formik.errors.shippingAddress?.street}</div>
            )}
          </div>

          <div>
            <label htmlFor="shippingCity">City:</label>
            <input
              type="text"
              id="shippingCity"
              name="shippingAddress.city"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shippingAddress.city}
            />
            {formik.touched.shippingAddress?.city && formik.errors.shippingAddress?.city && (
              <div className="error-message">{formik.errors.shippingAddress?.city}</div>
            )}
          </div>
          <div>
            <label htmlFor="shippingState">State:</label>
            <input
              type="text"
              id="shippingState"
              name="shippingAddress.state"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shippingAddress.state}
            />
            {formik.touched.shippingAddress?.state && formik.errors.shippingAddress?.state && (
              <div className="error-message">{formik.errors.shippingAddress?.state}</div>
            )}
          </div>
          <div>
            <label htmlFor="shippingCountry">Country:</label>
            <input
              type="text"
              id="shippingCountry"
              name="shippingAddress.country"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shippingAddress.country}
            />
            {formik.touched.shippingAddress?.country && formik.errors.shippingAddress?.country && (
              <div className="error-message">{formik.errors.shippingAddress?.country}</div>
            )}
          </div>
          <div>
            <label htmlFor="shippingZipCode">Zip Code:</label>
            <input
              type="text"
              id="shippingZipCode"
              name="shippingAddress.zipcode"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.shippingAddress.zipcode}
            />
            {formik.touched.shippingAddress?.zipcode && formik.errors.shippingAddress?.zipcode && (
              <div className="error-message">{formik.errors.shippingAddress?.zipcode}</div>
            )}
          </div>
          {/* ... (other shipping address fields) */}
        </div>
      {/* )} */}

      {/* Payment Type */}
      <div>
        <label htmlFor="paymentType">Payment Type:</label>
        <input
          type="text"
          id="paymentType"
          name="paymentType"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.paymentType}
          className={formik.touched.paymentType && formik.errors.paymentType ? 'error' : ''}
        />
        {formik.touched.paymentType && formik.errors.paymentType && (
          <div className="error-message">{formik.errors.paymentType}</div>
        )}
      </div>

      {/* Submit button */}
      <div className='buttons'>
        <button type="button" onClick={formik.submitForm}>
          Proceed to Pay
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
