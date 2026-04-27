import React, { useState, useEffect } from 'react';
import { 
    MdEmail, 
    MdSearch, 
    MdRefresh, 
    MdSend, 
    MdBlock, 
    MdCheckCircle,
    MdMoreVert,
    MdOutlineMailOutline
} from 'react-icons/md';
import { request } from '../../../../util/APIUtils';
import { NEWSLETTER_TEMPLATES } from './templates';
import Alert from 'react-s-alert';
import './NewsletterManager.css';

const NewsletterManagerPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({ subject: '', htmlBody: '' });
    const [sending, setSending] = useState(false);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const response = await request({
                url: `/api/newsletter/subscribers?page=${page}&size=10&search=${search}`,
                method: 'GET'
            });
            setSubscribers(response.content);
            setTotalPages(response.totalPages);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            Alert.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, [page, search]);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await request({
                url: `/api/newsletter/subscribers/${id}/status`,
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            Alert.success(`Subscriber status updated to ${newStatus}`);
            fetchSubscribers();
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.error('Failed to update status');
        }
    };

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!emailData.subject || !emailData.htmlBody) {
            Alert.warning('Subject and HTML Body are required');
            return;
        }

        setSending(true);
        try {
            const response = await request({
                url: '/api/newsletter/send-email',
                method: 'POST',
                body: JSON.stringify(emailData)
            });
            Alert.success(response.message || 'Newsletter sent successfully');
            setShowEmailModal(false);
            setEmailData({ subject: '', htmlBody: '' });
        } catch (error) {
            console.error('Error sending email:', error);
            const errorMessage = typeof error === 'string' ? error : (error.message || 'Failed to send newsletter');
            Alert.error(errorMessage);
        } finally {
            setSending(false);
        }
    };

    const handleTemplateSelect = (templateId) => {
        if (!templateId) {
            setEmailData({ subject: '', htmlBody: '' });
            return;
        }
        const template = NEWSLETTER_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setEmailData({
                subject: template.subject,
                htmlBody: template.htmlBody
            });
        }
    };

    return (
        <div className="newsletter-manager">
            <div className="page-header">
                <div className="header-info">
                    <h1 className="page-title">Newsletter Management</h1>
                    <p className="page-subtitle">Manage your subscribers and send marketing emails</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowEmailModal(true)}>
                        <MdSend /> Send Newsletter
                    </button>
                    <button className="btn-secondary" onClick={() => fetchSubscribers()}>
                        <MdRefresh /> Refresh
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon subscribers"><MdEmail /></div>
                    <div className="stat-content">
                        <span className="stat-label">Total Subscribers</span>
                        <span className="stat-value">{subscribers.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active"><MdCheckCircle /></div>
                    <div className="stat-content">
                        <span className="stat-label">Active</span>
                        <span className="stat-value">
                            {subscribers.filter(s => s.status === 'active').length}
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon inactive"><MdBlock /></div>
                    <div className="stat-content">
                        <span className="stat-label">Inactive</span>
                        <span className="stat-value">
                            {subscribers.filter(s => s.status === 'inactive').length}
                        </span>
                    </div>
                </div>
            </div>

            <div className="content-card">
                <div className="card-header">
                    <div className="search-box">
                        <MdSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search by email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Subscribed At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">Loading subscribers...</td>
                                </tr>
                            ) : subscribers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">No subscribers found</td>
                                </tr>
                            ) : (
                                subscribers.map((sub) => (
                                    <tr key={sub.id}>
                                        <td>
                                            <div className="user-email">
                                                <MdOutlineMailOutline className="email-icon" />
                                                {sub.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${sub.status}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                                        <td>
                                            <button 
                                                className={`btn-icon ${sub.status === 'active' ? 'deactivate' : 'activate'}`}
                                                onClick={() => handleToggleStatus(sub.id, sub.status)}
                                                title={sub.status === 'active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {sub.status === 'active' ? <MdBlock /> : <MdCheckCircle />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button 
                        disabled={page === 0} 
                        onClick={() => setPage(page - 1)}
                        className="btn-page"
                    >
                        Previous
                    </button>
                    <span className="page-info">Page {page + 1} of {totalPages || 1}</span>
                    <button 
                        disabled={page >= totalPages - 1} 
                        onClick={() => setPage(page + 1)}
                        className="btn-page"
                    >
                        Next
                    </button>
                </div>
            </div>

            {showEmailModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Send New Newsletter</h3>
                            <button className="close-btn" onClick={() => setShowEmailModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSendEmail}>
                            <div className="form-group">
                                <label>Select Template (Optional)</label>
                                <select 
                                    className="template-select"
                                    onChange={(e) => handleTemplateSelect(e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="">-- Choose a template --</option>
                                    {NEWSLETTER_TEMPLATES.map(template => (
                                        <option key={template.id} value={template.id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <input 
                                    type="text" 
                                    value={emailData.subject}
                                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                                    placeholder="Enter email subject"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>HTML Content</label>
                                <textarea 
                                    value={emailData.htmlBody}
                                    onChange={(e) => setEmailData({...emailData, htmlBody: e.target.value})}
                                    placeholder="Paste your HTML content here..."
                                    rows="10"
                                    required
                                ></textarea>
                                <p className="form-help">Tip: You can use HTML tags to style your email.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={sending}>
                                    {sending ? 'Sending...' : 'Send to All Active Subscribers'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsletterManagerPage;
