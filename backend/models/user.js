'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            User.hasMany(models.Order, { foreignKey: 'user_id' });
            User.hasMany(models.Cart, { foreignKey: 'user_id' });
            User.hasOne(models.Privilege, { foreignKey: 'user_id', as: 'Privileges' });
        }
    }
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.ENUM('user', 'admin', 'superadmin'),
        phoneNumber: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'User',
    });
    return User;
};