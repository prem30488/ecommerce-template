'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProductImage extends Model {
        static associate(models) {
            ProductImage.belongsTo(models.Product, { foreignKey: 'product_id' });
            ProductImage.belongsTo(models.Flavor, { foreignKey: 'flavor_id' });
        }
    }
    ProductImage.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        flavor_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Flavors',
                key: 'id'
            },
            allowNull: true
        },
        url: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'ProductImage',
    });
    return ProductImage;
};
