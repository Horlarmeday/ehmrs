'use strict';
module.exports = (sequelize, DataTypes) => {
  const PrescribedDrug = sequelize.define(
    'PrescribedDrug',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      drug_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'drug id is required',
          },
        },
      },
      drug_type: {
        type: DataTypes.ENUM('Cash', 'NHIS'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'drug type is required',
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'quantity is required',
          },
        },
      },
      quantity_to_dispense: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'quantity to dispense is required',
          },
        },
      },
      route: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'route is required',
          },
        },
      },
      dosage_form: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'dosage form is required',
          },
        },
      },
      frequency: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'frequency is required',
          },
        },
      },
      strength: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'strength is required',
          },
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'duration is required',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'total price is required',
          },
        },
      },
      is_dispensed: {
        type: DataTypes.ENUM('Dispensed', 'Pending', 'Returned'),
        defaultValue: 'Pending',
      },
      examiner: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'examiner is required',
          },
        },
      },
      date_prescribed: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'date prescribed is required',
          },
        },
      },
      payment_status: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Cleared'),
        allowNull: true,
        defaultValue: 'Pending',
      },
      prescribed_strength: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'prescribed strength is required',
          },
        },
      },
      duration_unit: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'duration unit is required',
          },
        },
      },
      capitated_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      is_nhis_drug_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'start date is required',
          },
        },
      },
    },
    {
      tableName: 'Prescribed_Drugs',
    }
  );
  PrescribedDrug.associate = ({ Staff, Patient, Drug, Visit }) => {
    // associations can be defined here
    PrescribedDrug.belongsTo(Staff, {
      foreignKey: 'examiner',
      as: 'requester',
    });

    PrescribedDrug.belongsTo(Patient, {
      foreignKey: 'patient_id',
      as: 'patient',
    });

    PrescribedDrug.belongsTo(Drug, {
      foreignKey: 'drug_id',
      as: 'drug',
    });

    PrescribedDrug.belongsTo(Visit, {
      foreignKey: 'visit_id',
      as: 'visit',
    });
  };
  return PrescribedDrug;
};
