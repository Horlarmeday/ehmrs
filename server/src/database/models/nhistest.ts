import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const NhisTest = sequelize.define(
    'NhisTest',
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
      type: {
        type: DataTypes.ENUM('primary', 'secondary'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'type of test is required',
          },
        },
      },
    },
    {
      tableName: 'Nhis_Tests',
    }
  );
  NhisTest.associate = ({ Staff, TestSample }) => {
    // associations can be defined here
    NhisTest.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    NhisTest.belongsTo(TestSample, {
      foreignKey: 'sample_id',
    });
  };
  sequelizePaginate.paginate(NhisTest);
  return NhisTest;
};
