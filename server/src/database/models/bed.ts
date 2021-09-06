module.exports = (sequelize, DataTypes) => {
  const Bed = sequelize.define(
    'Bed',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      bed_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'bed type is required',
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
      ward_id: DataTypes.INTEGER,
    },
    {}
  );
  Bed.associate = ({ Staff, Ward }) => {
    // associations can be defined here
    Bed.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    Bed.belongsTo(Ward, {
      foreignKey: 'ward_id',
    });
  };
  return Bed;
};
