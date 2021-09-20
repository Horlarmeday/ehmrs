import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const HMO = sequelize.define(
    'HMO',
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
            msg: 'name of hmo is required',
          },
        },
      },
      hmo_num: {
        type: DataTypes.STRING,
      },
      staff_id: {
        type: DataTypes.INTEGER,
      },
      insurance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'insurance id is required',
          },
        },
      },
    },
    {}
  );
  HMO.associate = ({ Insurance }) => {
    // associations can be defined here
    HMO.belongsTo(Insurance, {
      foreignKey: 'insurance_id',
      as: 'insurance',
    });
  };
  sequelizePaginate.paginate(HMO);
  return HMO;
};
