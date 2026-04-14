/**
 * Utility for handling regional settings like currency and language.
 */

export const getRegionalSettings = () => {
    const saved = localStorage.getItem('admin_regional_settings');
    return saved ? JSON.parse(saved) : {
        language: 'en-IN',
        currency: 'INR'
    };
};

export const saveRegionalSettings = (settings) => {
    localStorage.setItem('admin_regional_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('regionalSettingsChanged'));
};

const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
};

/**
 * Formats a number as currency based on settings.
 */
export const formatCurrency = (amount) => {
    const { currency, language } = getRegionalSettings();
    
    // Some components might pass strings
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    try {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency: currency,
        }).format(value || 0);
    } catch (e) {
        // Fallback for invalid codes
        return `${CURRENCY_SYMBOLS[currency] || currency} ${Number(value || 0).toFixed(2)}`;
    }
};

/**
 * Formats a date based on chosen language.
 */
export const formatDate = (date) => {
    const { language } = getRegionalSettings();
    const d = new Date(date);
    return d.toLocaleDateString(language, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
