import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Test = sequelize.define(
    'Test',
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
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'code is required',
          },
        },
      },
      staff_id: DataTypes.INTEGER,
      sample_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'sample id is required',
          },
        },
      },
    },
    {}
  );
  Test.associate = ({ Staff, TestSample }) => {
    // associations can be defined here
    Test.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    Test.belongsTo(TestSample, {
      foreignKey: 'sample_id',
    });
  };
  sequelizePaginate.paginate(Test);
  return Test;
};
