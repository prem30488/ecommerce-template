import React from 'react';
import { COMPANY_INFO } from '../constants/companyInfo';
import './onlineSupport.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

library.add(faPhone, faWhatsapp, faEnvelope);

const OnlineSupport = () => {
    return (
        <section className="support-section">
            <div className="container mx-auto">
                <div className="support-header">
                    <span className="support-eyebrow">SPECIALISTS AVAILABLE</span>
                    <h2 className="support-title">Online Support</h2>
                </div>

                <div className="support-grid">
                    <a href={`tel:${COMPANY_INFO.phone1}`} className="support-card-link">
                        <div className="support-card">
                            <div className="support-icon-wrap">
                                <FontAwesomeIcon icon={faPhone} className="support-icon" />
                            </div>
                            <div className="support-content">
                                <h4 className="support-card-title">Call Us</h4>
                                <p className="support-card-text">Call now {COMPANY_INFO.phone1}</p>
                            </div>
                        </div>
                    </a>

                    <a href={`https://wa.me/${COMPANY_INFO.phone1.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="support-card-link">
                        <div className="support-card">
                            <div className="support-icon-wrap">
                                <FontAwesomeIcon icon={faWhatsapp} className="support-icon" />
                            </div>
                            <div className="support-content">
                                <h4 className="support-card-title">Chat with Us</h4>
                                <p className="support-card-text">Chat now with an expert</p>
                            </div>
                        </div>
                    </a>

                    <a href={`mailto:${COMPANY_INFO.email}`} className="support-card-link">
                        <div className="support-card">
                            <div className="support-icon-wrap">
                                <FontAwesomeIcon icon={faEnvelope} className="support-icon" />
                            </div>
                            <div className="support-content">
                                <h4 className="support-card-title">Email Us</h4>
                                <p className="support-card-text">Contact now with our team</p>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="support-footer">
                    <p className="support-footer-text">
                        <strong>Contact Us:</strong> Contact us at <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>, and we'll get back to you within 24 hours.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default OnlineSupport;
