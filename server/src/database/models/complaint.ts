module.exports = (sequelize, DataTypes) => {
  const Complaint = sequelize.define(
    'Complaint',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      complaint: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'complaint is required',
          },
        },
      },
      frequency: {
        type: DataTypes.ENUM('Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Years'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'frequency is required',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
      },
      frequency_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: false,
        },
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
        validate: {
          notEmpty: false,
        },
      },
    },
    {}
  );
  Complaint.associate = ({ Patient, Visit, Staff }) => {
    // associations can be defined here
    Complaint.belongsTo(Visit, {
      foreignKey: 'visit_id',
    });

    Complaint.belongsTo(Patient, {
      foreignKey: 'patient_id',
    });

    Complaint.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  return Complaint;
};
