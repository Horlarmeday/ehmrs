'use strict';
module.exports = (sequelize, DataTypes) => {
  const Triage = sequelize.define('Triage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patient_id: DataTypes.INTEGER,
    visit_id: DataTypes.INTEGER,
    weight: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    bmi: DataTypes.FLOAT,
    rvs: DataTypes.STRING,
    pulse: DataTypes.FLOAT,
    respiration: DataTypes.STRING,
    temperature: DataTypes.FLOAT,
    systolic: DataTypes.INTEGER,
    diastolic: DataTypes.INTEGER,
    heart_rate: DataTypes.INTEGER,
    fetal_heart_rate: DataTypes.INTEGER,
    spo2: DataTypes.INTEGER,
    muac: DataTypes.STRING,
    staff_id: DataTypes.INTEGER
  }, {});
  Triage.associate = function(models) {
    // associations can be defined here
  };
  return Triage;
};