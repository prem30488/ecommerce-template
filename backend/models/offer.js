'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Offer extends Model {
        static associate(models) {
            Offer.belongsTo(models.Product, { foreignKey: 'productId' });
        }
    }
    Offer.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        from: DataTypes.DATE,
        to: DataTypes.DATE,
        discount: DataTypes.FLOAT,
        buy: DataTypes.INTEGER,
        buyget: DataTypes.INTEGER,
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        size: DataTypes.STRING,
        type: DataTypes.INTEGER,
        freeProductid: DataTypes.INTEGER,
        freeProducttitle: DataTypes.STRING,
        freeProductsize: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Offer',
    });
    return Offer;
};
