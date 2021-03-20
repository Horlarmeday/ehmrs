import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Drug = sequelize.define(
    'Drug',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'name is required',
          },
        },
      },
      type: {
        type: DataTypes.ENUM('Drug', 'Consumable'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'type is required',
          },
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'name is required',
          },
        },
      },
      staff_id: DataTypes.INTEGER,
    },
    {}
  );
  Drug.associate = ({ Staff }) => {
    // associations can be defined here
    Drug.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  sequelizePaginate.paginate(Drug);
  return Drug;
};
