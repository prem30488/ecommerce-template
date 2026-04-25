import React from 'react';
import './confirmation-modal.css';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="conf-overlay" onClick={onClose}>
            <div className="conf-content" onClick={(e) => e.stopPropagation()}>
                {/* <button className="conf-close" onClick={onClose}><FaTimes /></button> */}
                <div className="conf-header">
                    <div className="conf-icon">
                        <FaExclamationTriangle />
                    </div>
                    <h2>{title || 'Confirm Action'}</h2>
                </div>
                <div className="conf-body">
                    <p>{message || 'Are you sure you want to proceed?'}</p>
                </div>
                <div className="conf-footer">
                    <button className="conf-btn conf-cancel" onClick={onClose}>Cancel</button>
                    <button className="conf-btn conf-confirm" onClick={() => {
                        onConfirm();
                        onClose();
                    }}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
