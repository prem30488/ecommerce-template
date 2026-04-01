'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('SaleEvents', 'bannerImage', {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Multiple banner image paths or metadata',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('SaleEvents', 'bannerImage', {
            type: Sequelize.STRING,
            allowNull: true,
            comment: 'Path to banner image in /public/images/sales/',
        });
    },
};
