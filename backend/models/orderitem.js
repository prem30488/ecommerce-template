'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class OrderItem extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
            OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    OrderItem.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        order_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        flavor_id: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        price: DataTypes.FLOAT
    }, {
        sequelize,
        modelName: 'OrderItem',
    });
    return OrderItem;
};