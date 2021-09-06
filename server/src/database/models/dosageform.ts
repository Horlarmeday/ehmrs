module.exports = (sequelize, DataTypes) => {
  const DosageForm = sequelize.define(
    'DosageForm',
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
      tableName: 'Dosage_Forms',
    }
  );
  DosageForm.associate = ({ Staff }) => {
    // associations can be defined here
    DosageForm.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  return DosageForm;
};
