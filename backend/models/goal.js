module.exports = (sequelize, DataTypes) => {
    const Goal = sequelize.define('Goal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        revenueTarget: {
            type: DataTypes.FLOAT,
            defaultValue: 150000
        },
        ordersTarget: {
            type: DataTypes.INTEGER,
            defaultValue: 1200
        },
        customersTarget: {
            type: DataTypes.INTEGER,
            defaultValue: 500
        },
        month: {
            type: DataTypes.STRING, // format "YYYY-MM"
            unique: true
        }
    });

    return Goal;
};
