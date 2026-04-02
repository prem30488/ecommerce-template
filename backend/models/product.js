'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Product.belongsTo(models.Category, { foreignKey: 'category_id' });
            Product.hasMany(models.OrderItem, { foreignKey: 'product_id' });
            Product.hasMany(models.Cart, { foreignKey: 'product_id' });
            Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images' });
            Product.hasMany(models.Offer, { foreignKey: 'productId', as: 'offers' });
            Product.hasMany(models.FAQ, { foreignKey: 'productId', as: 'faqs' });
            Product.hasMany(models.ProductFlavor, { foreignKey: 'product_id', as: 'productFlavors' });
            Product.hasMany(models.Review, { foreignKey: 'productId', as: 'reviews' });
        }
    }
    Product.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        img: DataTypes.STRING,
        category_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Categories',
                key: 'id'
            }
        },
        brand: DataTypes.STRING,
        rating: DataTypes.STRING,
        bestseller: DataTypes.BOOLEAN,
        featured: DataTypes.BOOLEAN,
        audience: DataTypes.STRING,
        stock: DataTypes.INTEGER,
        compare: DataTypes.BOOLEAN,
        comingSoon: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        catIds: DataTypes.STRING,
        formId: DataTypes.INTEGER,
        hmsCode: DataTypes.STRING,
        unit: DataTypes.STRING,
        unitSmall: DataTypes.INTEGER,
        unitMedium: DataTypes.INTEGER,
        unitLarge: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Product',
    });
    return Product;
};