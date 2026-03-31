'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductFlavor extends Model {
        static associate(models) {
            ProductFlavor.belongsTo(models.Product, { foreignKey: 'product_id' });
            ProductFlavor.belongsTo(models.Flavor, { foreignKey: 'flavor_id' });
        }
    }
    ProductFlavor.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: DataTypes.INTEGER,
        flavor_id: DataTypes.INTEGER,
        price: DataTypes.FLOAT,
        priceMedium: DataTypes.FLOAT,
        priceLarge: DataTypes.FLOAT
    }, {
        sequelize,
        modelName: 'ProductFlavor',
    });
    return ProductFlavor;
};
