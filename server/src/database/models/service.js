import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
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
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'price is required',
          },
        },
      },
      staff_id: DataTypes.INTEGER,
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'code is required',
          },
        },
      },
    },
    {}
  );
  Service.associate = ({ Staff }) => {
    // associations can be defined here
    Service.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  sequelizePaginate.paginate(Service);
  return Service;
};
