import React from 'react';
import Sidebar from './Sidebar';
import AdminTopbar from './AdminTopbar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [darkMode, setDarkMode] = React.useState(false);

    return (
        <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-theme' : ''}`}>
            <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
            <div className="admin-content-wrapper">
                <AdminTopbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
                <main className="admin-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
