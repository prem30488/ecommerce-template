import React from 'react';
import { Helmet } from 'react-helmet-async';
import { COMPANY_INFO } from '../constants/companyInfo';

const SEO = ({ title, description, keywords, image, canonical }) => {
  const siteTitle = title ? `${title}` : `${COMPANY_INFO.name} - Premium Fashion & Elegance`;
  const siteDescription = description || COMPANY_INFO.seoDescription;
  const siteKeywords = keywords || COMPANY_INFO.seoKeywords;
  const siteImage = image || COMPANY_INFO.logoUrl;

  // Dynamic Canonical URL
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Verification Tags */}

      <meta name="google-site-verification" content="sV_b5l1QoV0qB3QvJ8Q7yQ68gC8096H0r927q39zT3E" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />
    </Helmet>
  );
};

export default SEO;

