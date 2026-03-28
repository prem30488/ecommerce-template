'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Wishlist extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Wishlist.belongsTo(models.User, { foreignKey: 'user_id' });
            Wishlist.belongsTo(models.Product, { foreignKey: 'product_id' });
        }
    }
    Wishlist.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        session_id: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Session ID for tracking anonymous wishlist items'
        },
        email_sent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether email has been sent on session close'
        }
    }, {
        sequelize,
        modelName: 'Wishlist',
        timestamps: true,
        underscored: true
    });
    return Wishlist;
};
