module.exports = (sequelize, DataTypes) => {
  const AppSetting = sequelize.define('AppSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    setting_key: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'AppSetting',
    timestamps: true
  });
  return AppSetting;
};
