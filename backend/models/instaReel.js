'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InstaReel extends Model {
    static associate(models) {
      // define association here
    }
  }
  InstaReel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    url: DataTypes.STRING,
    caption: DataTypes.TEXT,
    tag: DataTypes.STRING,
    orderIndex: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'InstaReel',
    tableName: 'InstaReels',
    timestamps: true
  });
  return InstaReel;
};
