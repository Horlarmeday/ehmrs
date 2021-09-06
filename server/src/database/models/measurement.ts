module.exports = (sequelize, DataTypes) => {
  const Measurement = sequelize.define(
    'Measurement',
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
      dosage_form_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'dosage form id is required',
          },
        },
      },
    },
    {}
  );
  Measurement.associate = ({ DosageForm }) => {
    // associations can be defined here
    Measurement.belongsTo(DosageForm, {
      foreignKey: 'dosage_form_id',
      as: 'dosage_form',
    });
  };
  return Measurement;
};
