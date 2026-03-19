'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Form extends Model {
        static associate(models) {
            // associations can be defined here
        }
    }
    Form.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        deleteFlag: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Form',
    });
    return Form;
};
