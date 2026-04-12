import React, { useEffect } from 'react';
import { COMPANY_INFO } from '../constants/companyInfo';

const SEO = ({ title, description, keywords }) => {
  useEffect(() => {
    // Update Title
    document.title = title ? `${title} | ${COMPANY_INFO.name}` : `${COMPANY_INFO.name} - Premium Fashion & Elegance`;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || COMPANY_INFO.seoDescription);

    // Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords || COMPANY_INFO.seoKeywords);

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title || COMPANY_INFO.name);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', COMPANY_INFO.logoUrl);

  }, [title, description, keywords]);

  return null; // This component doesn't render anything
};

export default SEO;
