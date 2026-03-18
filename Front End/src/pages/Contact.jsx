// ContactForm.js
import React from 'react';
import { useFormik } from 'formik';
import Alert from 'react-s-alert';
import axios from 'axios';
import { API_BASE_URL} from '../constants/index';
export const Contact = () => {

  const sendEmail = async (to, subject, text) => {
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', text);
  
      // Adjust the URL based on your actual API endpoint
      const apiUrl = API_BASE_URL+'/api/email/send';
  
      // Make a POST request using Axios
      const response = await axios.post(apiUrl, formData);
  
      // Handle the response as needed
      console.log('Response:', response.data);

      Alert.success("Success!");
    } catch (error) {
      // Handle errors
      console.error('Error:', error.message);
      Alert.error(error.message || 'Oops! Some error occurred!');
    }
  };
  

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) {
        errors.name = 'Required';
      }

      if (!values.email) {
        errors.email = 'Required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      if (!values.message) {
        errors.message = 'Required';
      }

      return errors;
    },
    onSubmit: (values) => {
      // This is where you would typically make an API call to a server to send the email
      // For example, using fetch or axios to send a POST request to a server endpoint
      // The server would then handle sending the email
      sendEmail("Nikul@hanelyhealthcare.com","Inquiry or Query from Hanely Healthcare website!",values.name + " " + values.email + " " +values.message);
      console.log('Form submitted:', values);
    },
  });

  return (
    <><div style={{paddingTop:"150px"}}></div> <h1>Contact Us</h1>
    
    <form onSubmit={formik.handleSubmit} style={{ maxWidth: '400px', margin: 'auto', backgroundColor: '#c4f2b2', padding: '20px', borderRadius: '10px' }}>
      <div style={{ marginBottom: '15px' }}>
      
        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
          Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
          style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        {formik.touched.name && formik.errors.name ? (
          <div style={{ color: 'red', marginTop: '5px' }}>{formik.errors.name}</div>
        ) : null}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
          Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        {formik.touched.email && formik.errors.email ? (
          <div style={{ color: 'red', marginTop: '5px' }}>{formik.errors.email}</div>
        ) : null}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
          Message:
        </label>
        <textarea
          id="message"
          name="message"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.message}
          style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', resize: 'vertical' }}
        />
        {formik.touched.message && formik.errors.message ? (
          <div style={{ color: 'red', marginTop: '5px' }}>{formik.errors.message}</div>
        ) : null}
      </div>

      <div>
        <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
          Submit
        </button>
      </div>
    </form>
    </>
  );
};

export default Contact;
