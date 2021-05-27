module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define(
    'History',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      complaint_note: {
        type: DataTypes.TEXT,
      },
      history_note: {
        type: DataTypes.TEXT,
      },
      examination_note: {
        type: DataTypes.TEXT,
      },
      has_smoking_history: {
        type: DataTypes.BOOLEAN,
      },
      staff_id: {
        type: DataTypes.INTEGER,
      },
      visit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: false,
        },
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: false,
        },
      },
    },
    {}
  );
  History.associate = function(models) {
    // associations can be defined here
  };
  return History;
};
