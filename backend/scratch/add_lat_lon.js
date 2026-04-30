require('dotenv').config();
const db = require('../models');

async function addLatLonColumns() {
  try {
    const queryInterface = db.sequelize.getQueryInterface();
    const tableDefinition = await queryInterface.describeTable('Orders');

    if (!tableDefinition.latitude) {
      console.log('Adding latitude column...');
      await queryInterface.addColumn('Orders', 'latitude', {
        type: db.Sequelize.FLOAT,
        allowNull: true
      });
      console.log('Latitude column added.');
    } else {
      console.log('Latitude column already exists.');
    }

    if (!tableDefinition.longitude) {
      console.log('Adding longitude column...');
      await queryInterface.addColumn('Orders', 'longitude', {
        type: db.Sequelize.FLOAT,
        allowNull: true
      });
      console.log('Longitude column added.');
    } else {
      console.log('Longitude column already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding columns:', error);
    process.exit(1);
  }
}

addLatLonColumns();
