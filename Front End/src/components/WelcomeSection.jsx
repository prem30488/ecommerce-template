import React, { useState, useEffect } from 'react';
import { getAppSettings } from '../util/APIUtils';
import './WelcomeSection.css';
import { FaPhoneAlt, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const WelcomeSection = () => {
    const [content, setContent] = useState({
        welcome_header: 'WELCOME TO ',
        welcome_title: "India's Most Trusted Pharma Healthcare",
        welcome_desc: "",
        welcome_image1: '/images/placeholder.png',
        welcome_image2: '/images/placeholder.png',
        welcome_image3: '/images/placeholder.png',
        welcome_cta_text: 'Need Pharma Franchise',
        welcome_cta_phone: '+91 7777936090'
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const settings = await getAppSettings();
                const newContent = { ...content };
                let hasUpdates = false;

                Object.keys(content).forEach(key => {
                    if (settings[key]) {
                        newContent[key] = settings[key];
                        hasUpdates = true;
                    }
                });

                if (hasUpdates) {
                    setContent(newContent);
                }
            } catch (error) {
                console.error("Error fetching welcome section content:", error);
            }
        };
        fetchContent();
    }, []);

    // Helper to render descriptions with line breaks
    const renderDescription = (text) => {
        return text.split('\n').map((line, i) => (
            <p key={i} className="welcome-paragraph">{line}</p>
        ));
    };

    return (
        <section className="welcome-section">
            <div className="welcome-container">
                <div className="welcome-visual">
                    <div className="image-grid">
                        <div className="image-item img-small-left">
                            <img src={content.welcome_image1} alt="Welcome 1" />
                        </div>
                        <div className="image-item img-small-right">
                            <img src={content.welcome_image2} alt="Welcome 2" />
                        </div>
                        <div className="image-item img-large-bottom">
                            <img src={content.welcome_image3} alt="Welcome 3" />
                        </div>
                    </div>

                    <div className="floating-cta-card">
                        <h3>{content.welcome_cta_text}</h3>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(i => <FaStar key={i} className="star-icon" />)}
                        </div>
                        <a href={`tel:${content.welcome_cta_phone}`} className="cta-phone">
                            <FaPhoneAlt className="phone-icon" />
                            {content.welcome_cta_phone}
                        </a>
                    </div>
                </div>

                <div className="welcome-content">
                    <span className="mini-header">{content.welcome_header}</span>
                    <h2 className="main-title">{content.welcome_title}</h2>
                    <div className="description-body">
                        {renderDescription(content.welcome_desc)}
                        <Link to="/about" className="welcome-about-btn">
                            Read More About Us here
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WelcomeSection;
