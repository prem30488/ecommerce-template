'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UserPrivilege extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    UserPrivilege.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        privilege_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Privileges',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'UserPrivilege',
        timestamps: false
    });
    return UserPrivilege;
};