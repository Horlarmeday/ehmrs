import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Insurance = sequelize.define(
    'Insurance',
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
            msg: 'name of insurance is required',
          },
        },
      },
      description: DataTypes.STRING,
      staff_id: DataTypes.INTEGER,
    },
    {}
  );
  Insurance.associate = ({ HMO }) => {
    // associations can be defined here
    Insurance.hasMany(HMO, {
      foreignKey: 'insurance_id',
    });
  };
  sequelizePaginate.paginate(Insurance);
  return Insurance;
};
