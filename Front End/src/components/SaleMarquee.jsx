import React, { useEffect, useState } from 'react';
import './SaleMarquee.css';

const SaleMarquee = ({ sales }) => {
    const [marqueText, setMarqueText] = useState('');

    useEffect(() => {
        if (!sales || sales.length === 0) return;

        // Build marquee text from active sales
        const marqueeContent = sales
            .map((sale) => {
                const diff = new Date(sale.endDate) - new Date();
                const minutes = Math.max(0, Math.floor(diff / (1000 * 60)));
                const days = Math.floor(minutes / (60 * 24));
                const hours = Math.floor((minutes % (60 * 24)) / 60);
                const mins = minutes % 60;
                const timeParts = [];
                if (days > 0) timeParts.push(`${days}d`);
                if (hours > 0) timeParts.push(`${hours}h`);
                if (days === 0 && mins > 0) timeParts.push(`${mins}m`);
                const remainingText = timeParts.length > 0 ? timeParts.join(' ') : '0m';

                let discount = '';
                switch (sale.discountType) {
                    case 'PERCENTAGE':
                        discount = `${sale.discountValue}% OFF`;
                        break;
                    case 'FIXED_AMOUNT':
                        discount = `$${sale.discountValue} OFF`;
                        break;
                    case 'BOGO':
                        discount = 'BUY 1 GET 1 FREE';
                        break;
                    case 'VOLUME':
                        discount = `BULK DISCOUNT`;
                        break;
                    default:
                        discount = 'SPECIAL OFFER';
                }

                return `🎉 ${sale.name} - ${discount} - Ends in ${remainingText}`;
            })
            .join('     |     ');

        setMarqueText(marqueeContent);
    }, [sales]);

    if (!marqueText) {
        return null;
    }

    return (
        <div className="sale-marquee-container">
            <div className="sale-marquee">
                <div className="sale-marquee-content">
                    <span className="marquee-icon">🔔</span>
                    <span className="marquee-text">{marqueText}</span>
                </div>
            </div>
        </div>
    );
};

export default SaleMarquee;
