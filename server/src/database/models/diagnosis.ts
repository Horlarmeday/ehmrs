module.exports = (sequelize, DataTypes) => {
  const Diagnosis = sequelize.define(
    'Diagnosis',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      diagnosis: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'diagnosis is required',
          },
        },
      },
      certainty: {
        type: DataTypes.ENUM('Presumed', 'Confirmed'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'pick a certainty',
          },
        },
      },
      order: {
        type: DataTypes.ENUM('Primary', 'Secondary'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'pick an order',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
      },
      visit_id: {
        type: DataTypes.INTEGER,
      },
      staff_id: {
        type: DataTypes.INTEGER,
      },
      patient_id: {
        type: DataTypes.INTEGER,
      },
    },
    {}
  );
  Diagnosis.associate = ({ Visit, Patient, Staff }) => {
    // associations can be defined here
    Diagnosis.belongsTo(Visit, {
      foreignKey: 'visit_id',
    });

    Diagnosis.belongsTo(Patient, {
      foreignKey: 'patient_id',
    });

    Diagnosis.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  return Diagnosis;
};
