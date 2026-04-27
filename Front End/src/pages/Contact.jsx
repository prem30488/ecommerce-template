import React from 'react';
import { useFormik } from 'formik';
import Alert from 'react-s-alert';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants/index';
import styles from './Contact.module.css';
import { COMPANY_INFO } from '../constants/companyInfo';
import SEO from '../components/SEO';
import CompanyGMapInfo from '../components/CompanyGMapInfo';
import LinearProgress from '../common/LinearProgress';

export const Contact = () => {
  const sendEmail = async (values) => {
    try {
      const formData = new FormData();
      formData.append('to', COMPANY_INFO.email);
      formData.append('subject', 'New Contact Form Inquiry');
      formData.append('text', `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phoneNumber}\nMessage: ${values.message}`);

      const apiUrl = API_BASE_URL + '/api/email/send';
      await axios.post(apiUrl, formData);

      Alert.success("Message sent successfully!");
    } catch (error) {
      console.error('Error:', error.message);
      Alert.error(error.message || 'Oops! Some error occurred!');
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phoneNumber: '',
      message: '',
      saveInfo: false,
      agreePolicy: false,
    },
    validate: (values) => {
      const errors = {};

      if (!values.name) errors.name = 'Required';
      if (!values.email) {
        errors.email = 'Required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.message) errors.message = 'Required';
      if (!values.agreePolicy) {
        errors.agreePolicy = 'You must agree to the Privacy Policy';
      }

      return errors;
    },
    onSubmit: (values, { resetForm }) => {
      sendEmail(values);
      console.log('Form submitted:', values);
      resetForm();
    },
  });

  return (
    <div className={styles.contactPage}>
      <LinearProgress loading={formik.isSubmitting} />
      <SEO title="Contact Us" description={`Contact ${COMPANY_INFO.name} for any inquiries regarding our premium fashion products.`} />
      <div className={styles.contactHeader}>
        <h1 className={styles.sectionTitle}>{COMPANY_INFO.name}</h1>
        <div className={styles.contactInfo}>
          <p>{COMPANY_INFO.address1}, {COMPANY_INFO.address2}</p>
          <p>{COMPANY_INFO.city}, {COMPANY_INFO.state} - {COMPANY_INFO.pinCode}</p>
          <div className={styles.phoneGroup}>
            <p><strong>Phone 1:</strong> {COMPANY_INFO.phone1}</p>
            {COMPANY_INFO.phone2 && <p><strong>Phone 2:</strong> {COMPANY_INFO.phone2}</p>}
            {COMPANY_INFO.faxNumber && <p><strong>Fax:</strong> {COMPANY_INFO.faxNumber}</p>}
          </div>
          <p><strong>Email:</strong> {COMPANY_INFO.email}</p>
          <p><strong>Website:</strong> <a href={COMPANY_INFO.websiteUrl} target="_blank" rel="noopener noreferrer">{COMPANY_INFO.websiteUrl}</a></p>
        </div>
      </div>
      {COMPANY_INFO.googleMapLink && (
        <div className={styles.mapContainer}>
          <CompanyGMapInfo height="400" />
        </div>
      )}




      <form onSubmit={formik.handleSubmit} className={styles.formContainer}>
        <div>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            className={styles.inputField}
          />
          {formik.touched.name && formik.errors.name ? (
            <div className={styles.error}>{formik.errors.name}</div>
          ) : null}
        </div>

        <div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={styles.inputField}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className={styles.error}>{formik.errors.email}</div>
          ) : null}
        </div>

        <div className={styles.fullWidth}>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            placeholder="Phone number"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phoneNumber}
            className={styles.inputField}
          />
        </div>

        <div className={styles.fullWidth}>
          <textarea
            id="message"
            name="message"
            placeholder="Comment"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.message}
            className={styles.textareaField}
          />
          {formik.touched.message && formik.errors.message ? (
            <div className={styles.error}>{formik.errors.message}</div>
          ) : null}
        </div>

        <div className={styles.checkboxContainer}>
          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              id="saveInfo"
              name="saveInfo"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.saveInfo}
            />
            <span>Save my name, email, and website in this browser for the next time I comment.</span>
          </label>

          <label className={styles.checkboxItem}>
            <input
              type="checkbox"
              id="agreePolicy"
              name="agreePolicy"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.agreePolicy}
            />
            <span style={{ lineHeight: '1.4' }}>
              By Submitting the form, I agree to the <Link to="/policies/privacy-policy" target="_blank" style={{ color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Privacy Policy</Link> and Website <Link to="/policies/terms-of-use" target="_blank" style={{ color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'underline' }}>Terms of Use</Link>
            </span>


          </label>
          {formik.touched.agreePolicy && formik.errors.agreePolicy ? (
            <div className={styles.error} style={{ marginTop: '-5px' }}>{formik.errors.agreePolicy}</div>
          ) : null}
        </div>

        <div className={styles.fullWidth}>
          <button type="submit" className={styles.submitBtn}>
            SEND MESSAGE
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
