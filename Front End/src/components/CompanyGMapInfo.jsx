import React, { useState, useEffect } from 'react';
import { COMPANY_INFO } from '../constants/companyInfo';
import { getAppSettings } from '../util/APIUtils';

const CompanyGmapInfo = ({ width = "100%", height = "400", style = { border: 0 } }) => {
  const [mapLink, setMapLink] = useState(COMPANY_INFO.googleMapLink);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        const settings = await getAppSettings();
        if (settings && settings.google_map_link) {
          setMapLink(settings.google_map_link);
        } else if (settings && settings.google_map_link === "") {
          // Explicitly empty in settings means hide it
          setMapLink("");
        }
      } catch (error) {
        console.error('Failed to fetch map link from settings:', error);
      }
    };
    fetchLink();
  }, []);

  if (!mapLink) {
    return null;
  }

  return (
    <iframe
      src={mapLink}
      width={width}
      height={height}
      style={style}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`${COMPANY_INFO.name} Location`}
    ></iframe>
  );
};

export default CompanyGmapInfo;
