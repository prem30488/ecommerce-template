'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SaleEvent extends Model {
        static associate(models) {
            // Association with Offer
            this.hasMany(models.Offer, {
                foreignKey: 'saleEventId',
                as: 'offers',
            });
            // Many-to-many relationship with Product through Offer
            // Access via: saleEvent.getProducts() or saleEvent.getOffers()
        }

        /**
         * Check if sale is currently active based on date range
         */
        isActive() {
            const now = new Date();
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            return (
                this.active &&
                start.getTime() <= now.getTime() &&
                now.getTime() <= end.getTime()
            );
        }

        /**
         * Get remaining days in sale
         */
        getDaysRemaining() {
            const now = new Date();
            if (now > this.endDate) return 0;
            const diff = this.endDate - now;
            return Math.ceil(diff / (1000 * 60 * 60 * 24));
        }

        /**
         * Get discount description
         */
        getDiscountDescription() {
            switch (this.discountType) {
                case 'PERCENTAGE':
                    return `${this.discountValue}% OFF`;
                case 'FIXED_AMOUNT':
                    return `$${this.discountValue} OFF`;
                case 'BOGO':
                    return 'Buy 1 Get 1 Free';
                case 'VOLUME':
                    return `Buy ${Math.floor(this.discountValue)} Get ${Math.ceil(this.discountValue)}% Off`;
                default:
                    return 'Special Offer';
            }
        }
    }

    SaleEvent.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            bannerImage: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            audience: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            discountType: {
                type: DataTypes.ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'VOLUME'),
                allowNull: false,
                defaultValue: 'PERCENTAGE',
            },
            discountValue: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            analyticsData: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: {
                    views: 0,
                    clicks: 0,
                    conversions: 0,
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'SaleEvent',
            tableName: 'SaleEvents',
            timestamps: true,
        }
    );

    return SaleEvent;
};
