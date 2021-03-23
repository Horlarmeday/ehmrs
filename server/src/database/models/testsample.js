import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const TestSample = sequelize.define(
    'TestSample',
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
    {
      tableName: 'Test_Samples',
    }
  );
  TestSample.associate = ({ Staff, Test, NhisTest }) => {
    // associations can be defined here
    TestSample.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    TestSample.hasMany(Test, {
      foreignKey: 'sample_id',
    });

    TestSample.hasMany(NhisTest, {
      foreignKey: 'sample_id',
    });
  };
  sequelizePaginate.paginate(TestSample);
  return TestSample;
};
