module.exports = (sequelize, DataTypes) => {
  const Triage = sequelize.define(
    'Triage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'patient id is required',
          },
        },
      },
      visit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'visit id is required',
          },
        },
      },
      weight: {
        type: DataTypes.FLOAT,
      },
      height: {
        type: DataTypes.FLOAT,
      },
      bmi: {
        type: DataTypes.FLOAT,
      },
      rvs: {
        type: DataTypes.STRING,
      },
      pulse: {
        type: DataTypes.FLOAT,
      },
      respiration: {
        type: DataTypes.STRING,
      },
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Temperature is required',
          },
        },
      },
      systolic: {
        type: DataTypes.STRING,
      },
      diastolic: {
        type: DataTypes.STRING,
      },
      heart_rate: {
        type: DataTypes.STRING,
      },
      fetal_heart_rate: {
        type: DataTypes.STRING,
      },
      spo2: {
        type: DataTypes.STRING,
      },
      muac: {
        type: DataTypes.STRING,
      },
      staff_id: {
        type: DataTypes.INTEGER,
      },
    },
    {}
  );
  Triage.associate = ({ Patient, Visit }) => {
    // associations can be defined here
    Triage.belongsTo(Patient, {
      foreignKey: 'patient_id',
    });

    Triage.belongsTo(Visit, {
      foreignKey: 'visit_id',
    });
  };
  return Triage;
};
