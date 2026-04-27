import React, { useState, useEffect } from 'react';
import { MdNotifications, MdFilterList, MdDoneAll, MdDeleteOutline, MdShoppingCart, MdComputer, MdPerson, MdReceipt } from 'react-icons/md';
import { fetchDashboardNotifications } from '../../util/APIUtils';
import { formatDate } from '../../util/regionalSettings';
import './AdminNotifications.css';
import LinearProgress from '../../common/LinearProgress';

const TYPE_TABS = [
    { key: 'all', label: 'All Notifications' },
    { key: 'order', label: 'Orders' },
    { key: 'session', label: 'Sessions' },
    { key: 'user', label: 'Users' },
    { key: 'invoice', label: 'Invoices' },
];

const TYPE_ICONS = {
    order: <MdShoppingCart />,
    session: <MdComputer />,
    user: <MdPerson />,
    invoice: <MdReceipt />,
};

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [read, setRead] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [notifPrefs] = useState(() => {
        const saved = localStorage.getItem('admin_notif_prefs');
        return saved ? JSON.parse(saved) : { order: true, invoice: true, user: true, session: true, stock: true };
    });

    useEffect(() => {
        setLoading(true);
        fetchDashboardNotifications()
            .then(res => {
                setNotifications(res.data || res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading notifications page:", err);
                setLoading(false);
            });
    }, []);

    // First filter by user preferences from Settings
    const visibleNotifications = notifications.filter(n => notifPrefs[n.type]);

    // Then filter by active tab
    const filtered = activeTab === 'all'
        ? visibleNotifications
        : visibleNotifications.filter(n => n.type === activeTab);

    const markAllRead = () => setRead(new Set(visibleNotifications.map(n => n.id)));
    const clearAll = () => setNotifications(prev => prev.filter(n => !notifPrefs[n.type]));
    const markRead = (id) => setRead(prev => new Set([...prev, id]));

    const formatTime = (dateString) => {
        return formatDate(dateString);
    };

    return (
        <div className="admin-notif-page">
            <LinearProgress loading={loading} />
            <header className="notif-page-header">
                <div className="header-left">
                    <h2>Notifications</h2>
                    <p>Stay updated with the latest store activities and alerts.</p>
                </div>
                <div className="header-actions">
                    <button className="notif-action-btn" onClick={markAllRead}>
                        <MdDoneAll /> Mark all as read
                    </button>
                    <button className="notif-action-btn delete" onClick={clearAll}>
                        <MdDeleteOutline /> Clear all
                    </button>
                </div>
            </header>

            <div className="notif-page-content">
                <div className="notif-card">
                    <div className="notif-card-header">
                        {TYPE_TABS.map(tab => {
                            // Only show tabs for enabled categories (always show 'All')
                            if (tab.key !== 'all' && !notifPrefs[tab.key]) return null;
                            
                            const count = notifications.filter(n => n.type === tab.key).length;
                            
                            return (
                                <div
                                    key={tab.key}
                                    className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                    {tab.key !== 'all' && (
                                        <span className="tab-count">{count}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="notif-page-list">
                        {loading ? (
                            <div className="no-notifs-placeholder">
                                <p>Loading notifications...</p>
                            </div>
                        ) : filtered.length > 0 ? (
                            filtered.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`notif-page-item ${notif.type} ${read.has(notif.id) ? 'read' : 'unread'}`}
                                    onClick={() => markRead(notif.id)}
                                >
                                    <div className={`notif-type-icon ${notif.type}`}>
                                        {TYPE_ICONS[notif.type] || <MdNotifications />}
                                    </div>
                                    <div className="notif-indicator"></div>
                                    <div className="notif-item-body">
                                        <p className="notif-item-text">{notif.text}</p>
                                        <span className="notif-item-time">{formatTime(notif.time)}</span>
                                    </div>
                                    {!read.has(notif.id) && <span className="unread-dot"></span>}
                                </div>
                            ))
                        ) : (
                            <div className="no-notifs-placeholder">
                                <MdNotifications size={48} />
                                <p>No notifications in this category</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotifications;
