import React, { useState, useEffect } from 'react';
import { MdSettings, MdSecurity, MdNotifications, MdPalette, MdLanguage, MdHelp, MdPerson, MdEdit, MdSave, MdClose, MdWeb } from 'react-icons/md';
import { COMPANY_INFO } from '../../constants/companyInfo';
import { getCurrentUser, updateUserProfile, changePassword, saveAppSettings, getAppSettings, uploadCMSImage } from '../../util/APIUtils';
import { getRegionalSettings, saveRegionalSettings } from '../../util/regionalSettings';
import { THEMES } from '../../styleguide/ThemeWrapper';
import './Settings.css';

// --- SUB-COMPONENTS (Defined before main component to avoid ReferenceErrors) ---

const ToggleRow = ({ label, desc, defaultOn }) => {
    const [on, setOn] = useState(defaultOn);
    return (
        <div className="toggle-row">
            <div>
                <p className="toggle-label">{label}</p>
                <p className="toggle-desc">{desc}</p>
            </div>
            <div className={`toggle-switch ${on ? 'on' : ''}`} onClick={() => setOn(!on)}>
                <div className="toggle-thumb"></div>
            </div>
        </div>
    );
};

const SecurityPanel = () => {
    const [fields, setFields] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const set = (key, val) => setFields(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        if (!fields.currentPassword || !fields.newPassword || !fields.confirmPassword) {
            return setStatus({ type: 'error', msg: 'All three fields are required.' });
        }
        if (fields.newPassword.length < 6) {
            return setStatus({ type: 'error', msg: 'New password must be at least 6 characters.' });
        }
        if (fields.newPassword !== fields.confirmPassword) {
            return setStatus({ type: 'error', msg: 'Passwords do not match.' });
        }
        setLoading(true);
        try {
            await changePassword({
                currentPassword: fields.currentPassword,
                newPassword: fields.newPassword,
            });
            setStatus({ type: 'success', msg: '✅ Password updated successfully!' });
            setFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ type: 'error', msg: `❌ ${err?.error || err?.message || 'Update failed.'}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-pane">
            <div className="pane-header">
                <div><h3>Security Settings</h3><p>Update your administrative password.</p></div>
            </div>
            {status && <div className={status.type === 'success' ? 'saved-banner' : 'error-banner'}>{status.msg}</div>}
            <form className="form-fields" onSubmit={handleSubmit}>
                <div className="form-group"><label>Current Password</label><input type="password" value={fields.currentPassword} onChange={e => set('currentPassword', e.target.value)} autoComplete="current-password" /></div>
                <div className="form-group"><label>New Password</label><input type="password" value={fields.newPassword} onChange={e => set('newPassword', e.target.value)} autoComplete="new-password" /></div>
                <div className="form-group"><label>Confirm New Password</label><input type="password" value={fields.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} autoComplete="new-password" /></div>
                <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Saving…' : '🔐 Update Password'}</button>
            </form>
        </div>
    );
};

const NotificationPreferences = () => {
    const [prefs, setPrefs] = useState(() => {
        const saved = localStorage.getItem('admin_notif_prefs');
        return saved ? JSON.parse(saved) : { order: true, invoice: true, user: true, session: true, stock: true };
    });
    const [saved, setSaved] = useState(false);
    const togglePref = (key) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        localStorage.setItem('admin_notif_prefs', JSON.stringify(newPrefs));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        window.dispatchEvent(new Event('notifPrefsChanged'));
    };
    const NOTIF_CONFIG = [
        { key: 'order', label: 'New Orders', desc: 'Alert when a new order is placed' },
        { key: 'invoice', label: 'Invoice Generated', desc: 'Alert when a tax invoice is created' },
        { key: 'user', label: 'New User Registration', desc: 'Alert when a user registers' },
        { key: 'session', label: 'Active Sessions', desc: 'Geographic activity alerts' },
        { key: 'stock', label: 'Low Stock Warnings', desc: 'Alert when product stock is low' },
    ];
    return (
        <div className="settings-pane">
            <div className="pane-header">
                <div><h3>Notification Preferences</h3><p>Changes are applied instantly.</p></div>
            </div>
            {saved && <div className="saved-banner" style={{ marginBottom: '15px' }}>Preferences saved!</div>}
            <div className="toggle-list">
                {NOTIF_CONFIG.map(item => (
                    <div className="toggle-row" key={item.key}>
                        <div><p className="toggle-label">{item.label}</p><p className="toggle-desc">{item.desc}</p></div>
                        <div className={`toggle-switch ${prefs[item.key] ? 'on' : ''}`} onClick={() => togglePref(item.key)}><div className="toggle-thumb"></div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RegionalPanel = () => {
    const [settings, setSettings] = useState(getRegionalSettings());
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        saveRegionalSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };
    return (
        <div className="settings-pane">
            <div className="pane-header">
                <div><h3>Language & Region</h3><p>Customize localized formatting.</p></div>
            </div>
            {saved && <div className="saved-banner" style={{ marginBottom: '20px' }}>Regional settings updated!</div>}
            <div className="form-fields">
                <div className="form-group">
                    <label>Language & Locale</label>
                    <select value={settings.language} onChange={e => setSettings({ ...settings, language: e.target.value })}>
                        <option value="en-IN">English (India)</option>
                        <option value="en-US">English (United States)</option>
                        <option value="hi-IN">Hindi (India)</option>
                        <option value="de-DE">German (Germany)</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Currency</label>
                    <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                </div>
                <div style={{ padding: '15px', background: 'var(--color-bg-transparent, rgba(67, 24, 255, 0.05))', color: 'var(--color-text)', borderRadius: '12px', fontSize: '14px', border: '1px solid var(--color-divider)' }}>
                    <strong>Preview:</strong> {new Intl.NumberFormat(settings.language, { style: 'currency', currency: settings.currency }).format(1250.50)}
                </div>
                <button className="save-btn" onClick={handleSave}><MdSave /> Save Preferences</button>
            </div>
        </div>
    );
};

const PagesContentPanel = () => {
    const [welcomeContent, setWelcomeContent] = useState({
        welcome_header: '',
        welcome_title: '',
        welcome_desc: '',
        welcome_cta_text: '',
        welcome_cta_phone: '',
        welcome_image1: '',
        welcome_image2: '',
        welcome_image3: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        getAppSettings().then(res => {
            const content = { ...welcomeContent };
            let hasData = false;
            Object.keys(content).forEach(key => {
                if (res && res[key]) {
                    content[key] = res[key];
                    hasData = true;
                }
            });
            if (hasData) setWelcomeContent(content);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await saveAppSettings(welcomeContent);
            setStatus({ type: 'success', msg: '✅ Welcome section updated successfully!' });
        } catch (err) {
            setStatus({ type: 'error', msg: '❌ Failed to update content.' });
        } finally {
            setSaving(false);
            setTimeout(() => setStatus(null), 5000);
        }
    };

    const handleImageUpload = async (key, file) => {
        if (!file) return;
        try {
            const url = await uploadCMSImage(file);
            setWelcomeContent(prev => ({ ...prev, [key]: url }));
        } catch (err) {
            alert("Image upload failed");
        }
    };

    if (loading) return <div className="settings-pane">Loading content...</div>;

    return (
        <div className="settings-pane">
            <div className="pane-header">
                <div><h3>Custom Pages & Content</h3><p>Manage the dynamic sections of your storefront.</p></div>
            </div>
            
            <div className="content-section-card">
                <div className="card-pill">Home Page: Welcome Section</div>
                {status && <div className={status.type === 'success' ? 'saved-banner' : 'error-banner'} style={{margin: '10px 0'}}>{status.msg}</div>}
                
                <div className="form-fields">
                    <div className="form-group">
                        <label>Top Label (Mini Header)</label>
                        <input type="text" value={welcomeContent.welcome_header} onChange={e => setWelcomeContent({ ...welcomeContent, welcome_header: e.target.value })} placeholder="e.g. WELCOME TO OUR STORE" />
                    </div>
                    <div className="form-group">
                        <label>Main Headline</label>
                        <input type="text" value={welcomeContent.welcome_title} onChange={e => setWelcomeContent({ ...welcomeContent, welcome_title: e.target.value })} placeholder="Enter section title" />
                    </div>
                    <div className="form-group">
                        <label>Description Paragraphs (Use new lines to separate)</label>
                        <textarea rows="6" value={welcomeContent.welcome_desc} onChange={e => setWelcomeContent({ ...welcomeContent, welcome_desc: e.target.value })} placeholder="Write your content here..." style={{borderRadius: '12px', padding: '12px', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'inherit'}} />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="form-group">
                            <label>Floating Card: CTA Text</label>
                            <input type="text" value={welcomeContent.welcome_cta_text} onChange={e => setWelcomeContent({ ...welcomeContent, welcome_cta_text: e.target.value })} placeholder="Need Help?" />
                        </div>
                        <div className="form-group">
                            <label>Floating Card: CTA Phone</label>
                            <input type="text" value={welcomeContent.welcome_cta_phone} onChange={e => setWelcomeContent({ ...welcomeContent, welcome_cta_phone: e.target.value })} placeholder="+x xx xxx xxx" />
                        </div>
                    </div>

                    <label style={{marginTop: '10px', display: 'block', fontWeight: 'bold', color: 'var(--color-text, #1b2559)'}}>Section Images</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginTop: '10px' }}>
                        {[1, 2, 3].map(id => (
                            <div className="admin-img-uploader" key={id}>
                                <div className="admin-img-preview">
                                    <img src={welcomeContent[`welcome_image${id}`] || '/images/placeholder.png'} alt="Preview" />
                                    <label className="upload-overlay">
                                        <input type="file" hidden onChange={e => handleImageUpload(`welcome_image${id}`, e.target.files[0])} />
                                        <span>Change {id}</span>
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="save-btn" onClick={handleSave} disabled={saving} style={{marginTop: '30px'}}>
                        <MdSave /> {saving ? 'Saving...' : 'Update Welcome Section'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HelpCenter = () => {
    const [view, setView] = useState('links'); // 'links', 'docs', 'faq'

    const FAQ_DATA = [
        { 
            q: "How do I update the status of an order?", 
            a: "Go to 'Order Management', find your order, and use the dropdown in the 'Status' column. Changing the status to 'Delivered' or 'Shipped' will notify the system and update your dashboard analytics." 
        },
        { 
            q: "Why is the revenue on my dashboard different from last week?", 
            a: "The dashboard shows real-time data. Fluctuations may occur due to new orders, processed refunds, or filtered date ranges. Ensure your Regional Settings match your reporting period." 
        },
        { 
            q: "I changed my currency to Dollars, but I still see Rupees in some places.", 
            a: "Settings are applied globally. If you see old currency symbols, please refresh your browser. Most dashboard widgets and order tables update instantly." 
        },
        { 
            q: "Is it possible to download a list of all customers?", 
            a: "Currently, you can export all order-related data to Excel from the 'Order Management' page. Full customer list export is planned for a future update." 
        },
        { 
            q: "How do I reset my security password?", 
            a: "Navigate to Settings > Security. You must know your current password to set a new one. If you have forgotten your current password, contact the system administrator." 
        },
        { 
            q: "I turned off 'New Order' notifications, but I still see the badge.", 
            a: "Toggling notifications in Settings controls the dropdown alerts and real-time popups. It does not delete existing notifications from the database." 
        }
    ];

    if (view === 'docs') {
        return (
            <div className="settings-pane">
                <div className="pane-header">
                    <div><h3>Full Admin Documentation</h3><p>Comprehensive guide for the {COMPANY_INFO.name} Management System.</p></div>
                    <button className="cancel-btn" onClick={() => setView('links')}>Back</button>
                </div>
                <div className="docs-content" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                    <section>
                        <h4>📊 1. Dashboard & Analytics</h4>
                        <p>The **Dashboard** is your command center. It provides high-level KPIs:</p>
                        <ul>
                            <li><strong>Purchase Revenue:</strong> Total gross sales.</li>
                            <li><strong>Conversion Rate:</strong> Percentage of visitors who completed a purchase.</li>
                            <li><strong>Sales Trends:</strong> Visual graphs showing weekly and daily revenue fluctuations.</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h4>📦 2. Order Management</h4>
                        <p>This module allows you to track and fulfill every transaction:</p>
                        <ul>
                            <li><strong>Status Control:</strong> Manually move orders from 'Pending' to 'Delivered'.</li>
                            <li><strong>Invoice Generation:</strong> Click 'Print Invoice PDF' to generate professional receipts for your records.</li>
                            <li><strong>Data Export:</strong> Use 'Export Excel' to download transaction history for accounting.</li>
                        </ul>
                    </section>

                    <section>
                        <h4>👥 3. Customer Management</h4>
                        <p>Monitor your user base. View registration dates, contact information, and total spend for every registered customer on the platform.</p>
                    </section>

                    <section>
                        <h4>⚙️ 4. System Settings</h4>
                        <p>Personalize the admin experience:</p>
                        <ul>
                            <li><strong>Notifications:</strong> Select which events trigger browser alerts (Orders, Invoices, Sessions).</li>
                            <li><strong>Regional Preferences:</strong> Switch between multiple languages (Hindi, English) and currencies (INR, USD, EUR).</li>
                            <li><strong>Security:</strong> Update your administrative credentials regularly to maintain store safety.</li>
                        </ul>
                    </section>
                </div>
            </div>
        );
    }

    if (view === 'faq') {
        return (
            <div className="settings-pane">
                <div className="pane-header">
                    <div><h3>Frequently Asked Questions</h3><p>Quick troubleshooting and usage tips.</p></div>
                    <button className="cancel-btn" onClick={() => setView('links')}>Back</button>
                </div>
                <div className="faq-list" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                    {FAQ_DATA.map((item, i) => (
                        <div key={i} className="faq-item">
                            <p className="faq-q">Q: {item.q}</p>
                            <p className="faq-a">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="settings-pane">
            <div className="pane-header">
                <div><h3>Help & Support Center</h3><p>Learn how to master your store's administration.</p></div>
            </div>
            <div className="help-links">
                <div className="help-link-item" onClick={() => setView('docs')}>
                    <div style={{fontSize: '18px', marginBottom: '5px'}}>📖 Full Documentation</div>
                    <p style={{fontSize: '13px', color: '#64748b', margin: 0}}>In-depth guide for every module.</p>
                </div>
                <a className="help-link-item" href={`mailto:${COMPANY_INFO.email}`} style={{ textDecoration: 'none' }}>
                    <div style={{fontSize: '18px', marginBottom: '5px'}}>✉️ Contact Support</div>
                    <p style={{fontSize: '13px', color: '#64748b', margin: 0}}>Direct email to technical support.</p>
                </a>
                <div className="help-link-item" onClick={() => setView('faq')}>
                    <div style={{fontSize: '18px', marginBottom: '5px'}}>❓ Frequently Asked Questions</div>
                    <p style={{fontSize: '13px', color: '#64748b', margin: 0}}>Solve common issues instantly.</p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN SETTINGS COMPONENT ---

const Settings = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', phoneNumber: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState(null);

    useEffect(() => {
        getCurrentUser().then(res => {
            setCurrentUser(res);
            setFormData({
                username: res.username || '',
                phoneNumber: res.phoneNumber || ''
            });
        }).catch(err => console.error("Error loading user:", err));
    }, []);

    const handleSave = async () => {
        setSaveError(null);
        try {
            const updatedUser = await updateUserProfile(formData);
            setCurrentUser(updatedUser);
            setIsEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setSaveError(err?.error || "Failed to update profile.");
        }
    };

    const SECTIONS = [
        { key: 'profile', label: 'Profile', icon: <MdPerson /> },
        { key: 'security', label: 'Security', icon: <MdSecurity /> },
        { key: 'notifications', label: 'Notifications', icon: <MdNotifications /> },
        { key: 'appearance', label: 'Appearance', icon: <MdPalette /> },
        { key: 'pages', label: 'Pages & Content', icon: <MdWeb /> },
        { key: 'language', label: 'Language & Region', icon: <MdLanguage /> },
        { key: 'help', label: 'Help & Support', icon: <MdHelp /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className="settings-pane">
                        <div className="pane-header">
                            <div><h3>Profile Settings</h3><p>Update your public information.</p></div>
                            {!isEditing && <button className="edit-btn" onClick={() => setIsEditing(true)}><MdEdit /> Edit Profile</button>}
                            {isEditing && <button className="cancel-btn" onClick={() => setIsEditing(false)}><MdClose /> Cancel</button>}
                        </div>
                        {saved && <div className="saved-banner">✅ Profile updated successfully!</div>}
                        {saveError && <div className="error-banner">{saveError}</div>}
                        <div className="profile-avatar-section">
                            <div className="avatar-circle">{currentUser ? (currentUser.username || 'A')[0].toUpperCase() : 'A'}</div>
                            <div className="avatar-name"><h4>{currentUser?.username || 'Admin'}</h4><p>{currentUser?.email}</p></div>
                        </div>
                        <div className="form-fields">
                            <div className="form-group"><label>Full Name / Username</label><input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} disabled={!isEditing} /></div>
                            <div className="form-group"><label>Email Address</label><input type="email" value={currentUser?.email || ''} disabled /></div>
                            <div className="form-group"><label>Phone Number</label><input type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} disabled={!isEditing} /></div>
                            {isEditing && <button className="save-btn" onClick={handleSave}><MdSave /> Save Changes</button>}
                        </div>
                    </div>
                );
            case 'security': return <SecurityPanel />;
            case 'pages': return <PagesContentPanel />;
            case 'notifications': return <NotificationPreferences />;
            case 'appearance':
                const currentTheme = localStorage.getItem('app_theme') || 'Default';
                const handleThemeSelect = async (name) => {
                    localStorage.setItem('app_theme', name);
                    window.dispatchEvent(new Event('themeChanged'));

                    // Persist to Database
                    try {
                        await saveAppSettings({ app_theme: name });
                    } catch (err) {
                        console.error('Failed to sync theme with database:', err);
                    }

                    // Force re-render of this section
                    setActiveSection('appearance_reload');
                    setTimeout(() => setActiveSection('appearance'), 0);
                };

                return (
                    <div className="settings-pane">
                        <div className="pane-header">
                            <div><h3>Appearance & Themes</h3><p>Select a color palette for your entire storefront.</p></div>
                        </div>
                        <div className="theme-grid">
                            {Object.keys(THEMES).map(name => (
                                <div 
                                    key={name} 
                                    className={`theme-card ${currentTheme === name ? 'active' : ''}`}
                                    onClick={() => handleThemeSelect(name)}
                                >
                                    <div className="theme-preview" style={{ background: THEMES[name].background }}>
                                        <div className="color-bar primary" style={{ background: THEMES[name].primary }}></div>
                                        <div className="color-bar secondary" style={{ background: THEMES[name].secondary }}></div>
                                        <div className="color-dots">
                                            <span style={{ background: THEMES[name].nav }}></span>
                                            <span style={{ background: THEMES[name].badgeSale }}></span>
                                            <span style={{ background: THEMES[name].inStock }}></span>
                                        </div>
                                    </div>
                                    <div className="theme-meta">
                                        <p className="theme-name">{name}</p>
                                        {currentTheme === name && <span className="active-tag">Active</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'language': return <RegionalPanel />;
            case 'help': return <HelpCenter />;
            default: return null;
        }
    };

    return (
        <div className="admin-settings">
            <header className="settings-header"><h2>Settings</h2><p>Manage your account and dashboard preferences.</p></header>
            <div className="settings-layout">
                <div className="settings-sidebar">
                    {SECTIONS.map(s => (
                        <div key={s.key} className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
                            <span className="nav-icon">{s.icon}</span>
                            <span>{s.label}</span>
                        </div>
                    ))}
                </div>
                <div className="settings-content">{renderContent()}</div>
            </div>
        </div>
    );
};

export default Settings;
