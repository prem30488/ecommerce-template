'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Audiences', [
      { id: 1, name: 'Men', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Women', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Kids', createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Audiences', null, {});
  }
};
