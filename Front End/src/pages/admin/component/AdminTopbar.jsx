import React, { useState, useEffect, useRef } from 'react';
import { MdNotificationsNone, MdDarkMode, MdLightMode, MdSettings, MdLogout, MdPersonOutline, MdMenu } from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchDashboardNotifications, getCurrentUser } from '../../../util/APIUtils';
import { formatDate } from '../../../util/regionalSettings';
import { ACCESS_TOKEN } from '../../../constants';
import Alert from 'react-s-alert';
import './AdminTopbar.css';

const AdminTopbar = ({ darkMode, toggleDarkMode, toggleMobileSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [notifPrefs, setNotifPrefs] = useState(() => {
        const saved = localStorage.getItem('admin_notif_prefs');
        return saved ? JSON.parse(saved) : { order: true, invoice: true, user: true, session: true, stock: true };
    });
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);
    
    useEffect(() => {
        const loadData = async () => {
            try {
                const [notifs, user] = await Promise.all([
                    fetchDashboardNotifications(),
                    getCurrentUser()
                ]);
                setNotifications(notifs.data || notifs);
                setCurrentUser(user);
            } catch (err) {
                console.error("Error loading topbar data:", err);
            }
        };
        loadData();
        const interval = setInterval(() => {
            fetchDashboardNotifications()
                .then(res => setNotifications(res.data || res))
                .catch(err => console.error("Error polling notifications:", err));
        }, 30000);

        const handlePrefsChange = () => {
            const saved = localStorage.getItem('admin_notif_prefs');
            if (saved) setNotifPrefs(JSON.parse(saved));
        };
        window.addEventListener('notifPrefsChanged', handlePrefsChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('notifPrefsChanged', handlePrefsChange);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        Alert.success("You've been logged out successfully!");
        navigate("/SignIn");
        window.location.reload();
    };

    // Convert path to title (e.g., /categoryManagement -> Category Management)
    const getPageTitle = (path) => {
        if (path === '/dashboard') return 'Dashboard';
        const name = path.replace('/', '').replace('Management', ' Management');
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return formatDate(dateString);
    };

    const getInitials = (user) => {
        if (!user) return 'AD';
        const name = user.name || user.username || 'Admin';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="admin-topbar">
            {/* ... Breadcrumbs and Title ... */}
            <div className="topbar-left" data-title={getPageTitle(location.pathname)}>
                <button className="mobile-menu-toggle" onClick={toggleMobileSidebar}>
                    <MdMenu />
                </button>
                <nav className="breadcrumb">
                    <span className="breadcrumb-path">Pages</span>
                    <span className="breadcrumb-sep">/</span>
                    <span className="breadcrumb-current">{getPageTitle(location.pathname)}</span>
                </nav>
                <h1 className="topbar-title">{getPageTitle(location.pathname)}</h1>
            </div>

            <div className="topbar-right">
                <div className="topbar-actions">
                    <button className="action-btn" title="Toggle theme" onClick={toggleDarkMode}>
                        {darkMode ? <MdLightMode /> : <MdDarkMode />}
                    </button>
                    
                    <div className="notifications-wrapper" ref={dropdownRef}>
                        <button 
                            className="action-btn" 
                            title="Notifications"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <MdNotificationsNone />
                            {notifications.filter(n => notifPrefs[n.type]).length > 0 && 
                                <span className="notification-badge">{notifications.filter(n => notifPrefs[n.type]).length}</span>
                            }
                        </button>

                        {showNotifications && (
                            <div className="notifications-dropdown">
                                <div className="notifications-header">
                                    <h3>Notifications</h3>
                                    <span className="mark-read">Real-time Activity</span>
                                </div>
                                <div className="notifications-list">
                                    {notifications.filter(n => notifPrefs[n.type]).length > 0 ? (
                                        notifications.filter(n => notifPrefs[n.type]).map(notif => (
                                            <div key={notif.id} className={`notification-item ${notif.type}`}>
                                                <div className="notif-content">
                                                    <p className="notif-text">{notif.text}</p>
                                                    <span className="notif-time">{formatTime(notif.time)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-notifications">No recent activity</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="profile-wrapper" ref={profileRef}>
                        <div 
                            className="user-initials-btn" 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            {getInitials(currentUser)}
                        </div>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <div className="profile-header">
                                    <div className="profile-name">{currentUser?.name || currentUser?.username || 'Admin'}</div>
                                    <div className="profile-email">{currentUser?.email || 'admin@healthcare.com'}</div>
                                </div>
                                <div className="profile-menu">
                                    <div className="profile-menu-item" onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}>
                                        <MdSettings className="menu-icon" />
                                        <span>Settings</span>
                                    </div>
                                    <div className="profile-menu-item" onClick={() => { navigate("/adminNotifications"); setShowProfileMenu(false); }}>
                                        <MdNotificationsNone className="menu-icon" />
                                        <span>Notifications</span>
                                    </div>
                                    <div className="profile-divider"></div>
                                    <div className="profile-menu-item logout" onClick={handleLogout}>
                                        <MdLogout className="menu-icon" />
                                        <span>Log out</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopbar;
