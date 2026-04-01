'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Offers', 'saleEventId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'SaleEvents',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });

        // Add index for faster queries
        await queryInterface.addIndex('Offers', ['saleEventId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('Offers', ['saleEventId']);
        await queryInterface.removeColumn('Offers', 'saleEventId');
    },
};
