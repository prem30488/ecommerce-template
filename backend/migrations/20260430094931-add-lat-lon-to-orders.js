'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Orders', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'latitude');
    await queryInterface.removeColumn('Orders', 'longitude');
  }
};
