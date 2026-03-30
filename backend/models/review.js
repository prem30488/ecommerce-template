module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  Review.associate = (models) => {
    Review.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    Review.belongsTo(models.User, { foreignKey: 'approvedBy', as: 'approver' });
  };

  return Review;
};
