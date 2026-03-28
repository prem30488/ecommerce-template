'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Testimonial extends Model {
        static associate(models) {
        }
    }
    Testimonial.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        designation: DataTypes.STRING,
        organization: DataTypes.STRING,
        imageURL: DataTypes.STRING,
        rating: {
            type: DataTypes.FLOAT,
            defaultValue: 5
        },
        deleteFlag: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Testimonial',
    });
    return Testimonial;
};
