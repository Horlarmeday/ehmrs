'use strict';
module.exports = (sequelize, DataTypes) => {
  const Laboratory = sequelize.define('Laboratory', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    staff_id: DataTypes.INTEGER
  }, {});
  Laboratory.associate = function(models) {
    // associations can be defined here
  };
  return Laboratory;
};