import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    'Department',
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      staff_id: DataTypes.INTEGER,
    },
    {}
  );
  Department.associate = ({ Staff }) => {
    // associations can be defined here
    Department.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  sequelizePaginate.paginate(Department);
  return Department;
};
