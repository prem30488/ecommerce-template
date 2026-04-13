'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Order.belongsTo(models.User, { foreignKey: 'user_id' });
            Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
        }
    }
    Order.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        total: DataTypes.FLOAT,
        subTotal: DataTypes.FLOAT,
        paymentType: DataTypes.STRING,
        status: DataTypes.STRING,
        customer: DataTypes.JSON,
        billingAddress: DataTypes.JSON,
        delieveryAddress: DataTypes.JSON,
        created_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Order',
    });
    return Order;
};