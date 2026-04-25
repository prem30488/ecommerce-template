'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class HomeSection extends Model {
        static associate(models) {
            // no associations needed for now
        }
    }
    HomeSection.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        componentName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'HomeSection',
    });
    return HomeSection;
};
