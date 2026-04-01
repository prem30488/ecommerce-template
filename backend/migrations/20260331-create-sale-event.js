'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('SaleEvents', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            bannerImage: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Path to banner image in /public/images/sales/',
            },
            startDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            endDate: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Optional category filter (Men, Women, Kids)',
            },
            audience: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: 'Target audience',
            },
            discountType: {
                type: Sequelize.ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'VOLUME'),
                allowNull: false,
                defaultValue: 'PERCENTAGE',
            },
            discountValue: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                comment: 'Discount amount or percentage',
            },
            analyticsData: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: {
                    views: 0,
                    clicks: 0,
                    conversions: 0,
                },
                comment: 'Store {views, clicks, conversions} tracking data',
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Add indexes for common queries
        await queryInterface.addIndex('SaleEvents', ['startDate']);
        await queryInterface.addIndex('SaleEvents', ['endDate']);
        await queryInterface.addIndex('SaleEvents', ['active']);
        await queryInterface.addIndex('SaleEvents', ['category']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('SaleEvents');
    },
};
