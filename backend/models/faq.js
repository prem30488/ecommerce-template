module.exports = (sequelize, DataTypes) => {
    const FAQ = sequelize.define('FAQ', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        answer: {
            type: DataTypes.TEXT,
            defaultValue: 'COMING SOON'
        },
        askedBy: {
            type: DataTypes.STRING,
            allowNull: true
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products', // or whatever the table name is, maybe it doesn't even need references object if Sequelize auto-creates
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true
    });

    FAQ.associate = function(models) {
        FAQ.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    };

    return FAQ;
};