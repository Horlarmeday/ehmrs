module.exports = (sequelize, DataTypes) => {
  const PrescribedTest = sequelize.define(
    'PrescribedTest',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      test_id: {
        type: DataTypes.INTEGER,
      },
      nhis_test_id: {
        type: DataTypes.INTEGER,
      },
      requester: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'requester is required',
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
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'patient is required',
          },
        },
      },
      visit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'visit is required',
          },
        },
      },
      date_requested: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM('Pending', 'Cleared', 'Paid'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      is_test_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      test_verified_date: {
        type: DataTypes.DATE,
      },
      is_test_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      test_approved_date: {
        type: DataTypes.DATE,
      },
      test_verified_by: {
        type: DataTypes.INTEGER,
      },
      test_approved_by: {
        type: DataTypes.INTEGER,
      },
      is_nhis_test_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {}
  );
  PrescribedTest.associate = ({ Staff, Patient, Test, NhisTest }) => {
    // associations can be defined here
    PrescribedTest.belongsTo(Patient, {
      foreignKey: 'patient_id',
    });

    PrescribedTest.belongsTo(Test, {
      foreignKey: 'test_id',
      as: 'test',
    });

    PrescribedTest.belongsTo(NhisTest, {
      foreignKey: 'nhis_test_id',
      as: 'nhis_test',
    });

    PrescribedTest.belongsTo(Staff, {
      foreignKey: 'requester',
      as: 'examiner',
    });

    PrescribedTest.belongsTo(Staff, {
      foreignKey: 'test_verified_by',
      as: 'test_verifier',
    });

    PrescribedTest.belongsTo(Staff, {
      foreignKey: 'test_approved_by',
      as: 'test_approver',
    });
  };
  return PrescribedTest;
};
