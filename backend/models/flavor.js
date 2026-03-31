'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Flavor extends Model {
        static associate(models) {
            Flavor.hasMany(models.ProductImage, { foreignKey: 'flavor_id' });
            Flavor.hasMany(models.ProductFlavor, { foreignKey: 'flavor_id' });
        }
    }
    Flavor.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Flavor',
    });
    return Flavor;
};
