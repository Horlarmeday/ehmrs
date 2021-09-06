import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Ward = sequelize.define(
    'Ward',
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
      staff_id: DataTypes.INTEGER,
    },
    {}
  );
  Ward.associate = ({ Staff }) => {
    // associations can be defined here
    Ward.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  sequelizePaginate.paginate(Ward);
  return Ward;
};
