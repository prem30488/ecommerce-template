import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants';
import { fetchCustomers, toggleBlockUser } from '../../util/APIUtils';
import Alert from 'react-s-alert';
import { FaUserSlash, FaUserCheck, FaFilePdf, FaBan, FaInfoCircle, FaSearch } from 'react-icons/fa';
import { Paper, Typography, Container, CssBaseline, Switch, Tooltip } from '@mui/material';
import './CustomerManagement.css';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = () => {
        setLoading(true);
        fetchCustomers()
            .then(res => {
                setCustomers(res || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                Alert.error("Failed to load customers");
                setLoading(false);
            });
    };

    const handleToggleBlock = (email, isBlocked) => {
        const action = isBlocked ? "unblock" : "block";
        if (window.confirm(`Are you sure you want to ${action} this customer?`)) {
            toggleBlockUser(email)
                .then(res => {
                    Alert.success(res.isBlocked ? "Customer has been blocked" : "Customer has been unblocked");
                    // Optimistic local update for instant feedback
                    setCustomers(prev => prev.map(c =>
                        c.email === email ? { ...c, isBlocked: res.isBlocked } : c
                    ));
                    // Full sync with backend
                    loadCustomers();
                })
                .catch(err => {
                    console.error(err);
                    Alert.error("Failed to update status");
                });
        }
    };

    const formatAddress = (addr) => {
        if (!addr) return '-';
        if (typeof addr === 'string') {
            try {
                const parsed = JSON.parse(addr);
                if (parsed && typeof parsed === 'object') addr = parsed;
                else return addr;
            } catch (e) {
                return addr;
            }
        }
        
        if (typeof addr === 'object') {
            const parts = [
                addr.firstName && addr.lastName ? `${addr.firstName} ${addr.lastName}` : (addr.name || ''),
                addr.addressLine1 || addr.address || addr.street || '',
                addr.addressLine2 || '',
                addr.city || '',
                addr.state || addr.province || '',
                addr.zipcode || addr.pincode || addr.zip || ''
            ].filter(part => part && part.trim() !== '');
            
            return parts.length > 0 ? parts.join(', ') : 'Address Object (Missing Fields)';
        }
        return String(addr);
    };

    const filteredCustomers = customers.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.mobile || '').includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredCustomers.length / perPage);
    const indexOfLastItem = currentPage * perPage;
    const indexOfFirstItem = indexOfLastItem - perPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <CssBaseline />
            <Paper elevation={3} style={{ padding: '30px', borderRadius: '12px' }}>
                <Typography variant="h4" align="center" style={{ fontWeight: 800, color: '#cc4555', marginBottom: '30px', letterSpacing: '-0.5px' }}>
                    Customer Management
                </Typography>

                <div className="customer-management-container">
                    <div className="customers-header-actions">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, color: '#64748B' }}>
                                Total Found: {filteredCustomers.length}
                            </span>
                        </div>
                        <div className="search-bar-container">
                            <input
                                type="text"
                                className="customer-search-input"
                                placeholder="Search by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="customer-card">
                        <div style={{ padding: '0px', overflowX: 'auto' }}>
                            <table className="premium-customer-table">
                                <thead>
                                    <tr>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'center' }}>Orders</th>
                                        <th>Highest Purchase</th>
                                        <th>Addresses (Latest)</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCustomers.map((customer) => (
                                        <tr key={customer.id}>
                                            <td style={{ fontWeight: '700', color: '#1E293B' }}>{customer.name.split(' ')[0]}</td>
                                            <td style={{ fontWeight: '700', color: '#1E293B' }}>{customer.name.split(' ').slice(1).join(' ') || '-'}</td>
                                            <td style={{ color: '#475569', fontSize: '0.9rem' }}>{customer.email}</td>
                                            <td style={{ fontSize: '0.9rem' }}>{customer.mobile}</td>
                                            <td>
                                                <span className={`status-badge ${customer.is_blocked ? 'status-blocked' : 'status-active'}`}>
                                                    {customer.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <b style={{ fontSize: '1.1rem' }}>{customer.totalOrders}</b>
                                            </td>
                                            <td style={{ color: '#C2410C', fontWeight: '800', fontSize: '0.85rem' }}>
                                                {customer.topProduct}
                                            </td>
                                            <td style={{ fontSize: '0.75rem', maxWidth: '300px', lineHeight: '1.4' }}>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <b style={{ color: '#1E293B' }}>BILL:</b> {formatAddress(customer.billingAddress)}
                                                </div>
                                                <div>
                                                    <b style={{ color: '#1E293B' }}>SHIP:</b> {formatAddress(customer.deliveryAddress)}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                    {customer.lastOrderId && (
                                                        <button
                                                            className="view-invoice-btn"
                                                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                                            onClick={() => window.open(`${API_BASE_URL}/api/order/printInvoice/${customer.lastOrderId}`, '_blank')}
                                                            title="View Last Invoice PDF"
                                                        >
                                                            <FaFilePdf size={14} /> PDF
                                                        </button>
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: customer.is_blocked ? '#e11d48' : '#94a3b8' }}>
                                                            {customer.is_blocked ? 'Blocked' : 'Active'}
                                                        </span>
                                                        <Tooltip title={customer.is_blocked ? "Unblock Customer" : "Block Customer"}>
                                                            <Switch
                                                                checked={!!customer.is_blocked}
                                                                onChange={() => handleToggleBlock(customer.email, customer.is_blocked)}
                                                                color="error"
                                                                size="small"
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>            <div className="pagination-controls">
                        <div style={{ color: '#64748B', fontWeight: '500' }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} entries
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                            >
                                Previous
                            </button>
                            <span style={{ fontWeight: '700' }}>{currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                            >
                                Next
                            </button>
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Paper>
        </Container>
    );
};

export default CustomerManagement;
