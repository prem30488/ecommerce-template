// models/audience.js
'use strict';

module.exports = (sequelize, DataTypes) => {
    const Audience = sequelize.define('Audience', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        tableName: 'Audiences',
        timestamps: true
    });
    return Audience;
};
