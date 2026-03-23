import "./instagramreels.css";
import { InstagramEmbed } from 'react-social-media-embed';

const InstagramReels = () => {
    return (
        <section className="instagram-reels-section">
            <div className="reels-header">
                <span className="reels-subtitle">CONFIDENCE IN EVERY SIP</span>
                <h2 className="reels-title">Real People, Real Progress</h2>
            </div>
            <div className="reels-grid flex" style={{ display: 'flex', overflowX: 'auto', overflowX: 'scroll', flexWrap: 'nowrap' }}>

                <div key="1" className="reel-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <InstagramEmbed url="https://www.instagram.com/p/DRXEgrXk8-E/" width={328} />
                    </div>
                    <div className="reel-overlay">
                        <div className="product-info-pill">
                            <div className="product-icon-container">
                                <div className="placeholder-icon">H</div>
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">Pre-workout</h4>
                                <div className="product-pricing">
                                    <span className="current-price"></span>
                                    <span className="original-price"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div key="2" className="reel-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <InstagramEmbed url="https://www.instagram.com/p/DRL1MzWgdY4/?hl=en" width={328} />
                    </div>
                    <div className="reel-overlay">
                        <div className="product-info-pill">
                            <div className="product-icon-container">
                                <div className="placeholder-icon">H</div>
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">Sachet</h4>
                                <div className="product-pricing">
                                    <span className="current-price"></span>
                                    <span className="original-price"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div key="3" className="reel-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <InstagramEmbed url="https://www.instagram.com/p/DRENvp8DME0/?hl=en" width={328} />
                    </div>
                    <div className="reel-overlay">
                        <div className="product-info-pill">
                            <div className="product-icon-container">
                                <div className="placeholder-icon">H</div>
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">Way Protene</h4>
                                <div className="product-pricing">
                                    <span className="current-price"></span>
                                    <span className="original-price"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div key="4" className="reel-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <InstagramEmbed url="https://www.instagram.com/p/DQwO36rkmDo/?hl=en" width={328} />
                    </div>
                    <div className="reel-overlay">
                        <div className="product-info-pill">
                            <div className="product-icon-container">
                                <div className="placeholder-icon">H</div>
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">Shilajit</h4>
                                <div className="product-pricing">
                                    <span className="current-price"></span>
                                    <span className="original-price"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div key="5" className="reel-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <InstagramEmbed url="https://www.instagram.com/p/DPWXXbxjwZt/?hl=en" width={328} />
                    </div>
                    <div className="reel-overlay">
                        <div className="product-info-pill">
                            <div className="product-icon-container">
                                <div className="placeholder-icon">H</div>
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">Hair fall</h4>
                                <div className="product-pricing">
                                    <span className="current-price"></span>
                                    <span className="original-price"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div key="6" className="reel-card">
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <InstagramEmbed url="https://www.instagram.com/p/DOz_7moE9md/?hl=en" width={328} />
                    </div>
                    <div className="reel-overlay">
                        <div className="product-info-pill">
                            <div className="product-icon-container">
                                <div className="placeholder-icon">H</div>
                            </div>
                            <div className="product-details">
                                <h4 className="product-name">Post-workout</h4>
                                <div className="product-pricing">
                                    <span className="current-price"></span>
                                    <span className="original-price"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section >
    );
};

export default InstagramReels;
