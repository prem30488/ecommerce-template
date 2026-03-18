'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Privilege extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Privilege.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }
    Privilege.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: DataTypes.INTEGER,
        categories: { type: DataTypes.BOOLEAN, defaultValue: false },
        forms: { type: DataTypes.BOOLEAN, defaultValue: false },
        products: { type: DataTypes.BOOLEAN, defaultValue: false },
        orders: { type: DataTypes.BOOLEAN, defaultValue: false },
        coupons: { type: DataTypes.BOOLEAN, defaultValue: false },
        testimonials: { type: DataTypes.BOOLEAN, defaultValue: false },
        deleteFlag: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, {
        sequelize,
        modelName: 'Privilege',
    });
    return Privilege;
};