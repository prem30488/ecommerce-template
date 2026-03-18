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
            User.belongsToMany(models.Privilege, {
                through: 'UserPrivileges',
                foreignKey: 'user_id',
                otherKey: 'privilege_id'
            });
        }
    }
    User.init({
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