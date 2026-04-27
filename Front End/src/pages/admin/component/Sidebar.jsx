import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    MdHome, 
    MdPeople, 
    MdCategory, 
    MdShoppingCart, 
    MdAssignment, 
    MdLocalOffer, 
    MdRateReview, 
    MdCampaign, 
    MdViewCarousel, 
    MdGroups, 
    MdQuestionAnswer, 
    MdIcecream, 
    MdDescription,
    MdLogout,
    MdDashboard,
    MdAnalytics,
    MdEmail,
    MdChat,
    MdFolder,
    MdCalendarToday,
    MdPerson,
    MdChevronRight,
    MdMenu
} from 'react-icons/md';
import { LuLayoutDashboard } from "react-icons/lu";
import { getCurrentUser, getPrivileges } from '../../../util/APIUtils';
import { ACCESS_TOKEN } from '../../../constants';
import { COMPANY_INFO } from '../../../constants/companyInfo';
import Alert from 'react-s-alert';
import './Sidebar.css';

const Sidebar = ({ collapsed, toggleCollapse, mobileOpen, closeMobile }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [privileges, setPrivileges] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUser(user);

                if (user && user.roles && user.roles[0].name !== "ROLE_SUPERADMIN") {
                    const privsResponse = await getPrivileges(user.id);
                    const data = privsResponse.data || privsResponse;
                    setPrivileges(data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        Alert.success("You're safely logged out!");
        navigate("/SignIn");
        window.location.reload();
    };

    const isSuperAdmin = currentUser && currentUser.roles && currentUser.roles[0].name === "ROLE_SUPERADMIN";

    const menuSections = [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", path: "/dashboard", icon: <LuLayoutDashboard />, show: true },
            ]
        },
        {
            title: "COMMERCE",
            items: [
                { label: "Orders", path: "/orderManagement", icon: <MdAssignment />, show: privileges.orders || isSuperAdmin },
                { label: "Products", path: "/productManagement", icon: <MdShoppingCart />, show: privileges.products || isSuperAdmin },
                { label: "Customers", path: "/customerManagement", icon: <MdPeople />, show: isSuperAdmin },
                { label: "Categories", path: "/categoryManagement", icon: <MdCategory />, show: privileges.categories || isSuperAdmin },
                { label: "Coupons", path: "/couponManagement", icon: <MdLocalOffer />, show: privileges.coupons || isSuperAdmin },
                { label: "Sales", path: "/saleManagement", icon: <MdCampaign />, show: privileges.sales || isSuperAdmin },
            ]
        },
        {
            title: "MANAGEMENT",
            items: [
                { label: "Users", path: "/userManagement", icon: <MdGroups />, show: isSuperAdmin },
                { label: "Reviews", path: "/reviewManagement", icon: <MdRateReview />, show: privileges.reviews || isSuperAdmin },
                { label: "FAQs", path: "/faqManagement", icon: <MdQuestionAnswer />, show: privileges.faqs || isSuperAdmin },
                { label: "Flavors", path: "/flavorManagement", icon: <MdIcecream />, show: privileges.flavors || isSuperAdmin },
                { label: "Forms", path: "/formManagement", icon: <MdDescription />, show: privileges.forms || isSuperAdmin },
                { label: "Sliders", path: "/sliderManagement", icon: <MdViewCarousel />, show: privileges.sliders || isSuperAdmin },
                { label: "Home Manager", path: "/homeManagement", icon: <MdHome />, show: isSuperAdmin || privileges.categories },
                { label: "Menu Manager", path: "/menuManagement", icon: <MdMenu />, show: isSuperAdmin },
                { label: "Leadership", path: "/leadershipManagement", icon: <MdPerson />, show: privileges.leadership || isSuperAdmin },
            ]
        }
    ];

    return (
        <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-icon">{COMPANY_INFO.name[0]}</div>
                {(!collapsed || mobileOpen) && (
                    <div className="logo-text">
                        <span className="logo-brand">{COMPANY_INFO.name}</span>
                        <span className="logo-sub">DASHBOARD</span>
                    </div>
                )}
                <button className="collapse-toggle" onClick={toggleCollapse}>
                    <MdChevronRight style={{ transform: (collapsed && !mobileOpen) ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
            </div>

            <div className="sidebar-scrollable">
                {menuSections.map((section, idx) => {
                    const visibleItems = section.items.filter(item => item.show);
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={idx} className="sidebar-section">
                            {(!collapsed || mobileOpen) && (
                                <div className="section-header">
                                    <span className="section-title">{section.title}</span>
                                    <MdChevronRight className="section-arrow" />
                                </div>
                            )}
                            <div className="section-items">
                                {visibleItems.map(item => (
                                    <NavLink 
                                        key={item.path} 
                                        to={item.path} 
                                        className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                                        title={collapsed ? item.label : ''}
                                        onClick={() => {
                                            if (window.innerWidth <= 991) closeMobile();
                                        }}
                                    >
                                        <span className="item-icon">{item.icon}</span>
                                        {(!collapsed || mobileOpen) && <span className="item-label">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {currentUser ? currentUser.username[0].toUpperCase() : 'A'}
                    </div>
                    {(!collapsed || mobileOpen) && (
                        <div className="user-info">
                            <span className="user-name">{currentUser ? currentUser.username : 'Admin'}</span>
                            <span className="user-role">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
                        </div>
                    )}
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <MdLogout />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
