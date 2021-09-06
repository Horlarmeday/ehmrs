import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'firstname is required',
          },
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'lastname is required',
          },
        },
      },
      middlename: {
        type: DataTypes.STRING,
      },
      gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'gender is required',
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'phone number is required',
          },
        },
      },
      alt_phone: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'address is required',
          },
        },
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'country is required',
          },
        },
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'state is required',
          },
        },
      },
      lga: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'local govt is required',
          },
        },
      },
      hospital_id: {
        type: DataTypes.STRING,
      },
      occupation: {
        type: DataTypes.STRING,
      },
      next_of_kin_name: {
        type: DataTypes.STRING,
      },
      next_of_kin_phone: {
        type: DataTypes.STRING,
      },
      next_of_kin_address: {
        type: DataTypes.TEXT,
      },
      relationship: {
        type: DataTypes.STRING,
      },
      photo: {
        type: DataTypes.TEXT,
      },
      photo_url: {
        type: DataTypes.TEXT,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'date of birth is required',
          },
        },
      },
      insurance_id: { type: DataTypes.INTEGER },
      hmo_id: { type: DataTypes.INTEGER },
      enrollee_code: { type: DataTypes.STRING },
      marital_status: {
        type: DataTypes.STRING,
      },
      religion: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'religion is required',
          },
        },
      },
      email: { type: DataTypes.STRING },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      organization: { type: DataTypes.STRING },
      plan: { type: DataTypes.STRING },
      has_insurance: { type: DataTypes.BOOLEAN, defaultValue: false },
      principal_id: { type: DataTypes.INTEGER },
      patient_type: {
        type: DataTypes.ENUM('Dependant', 'Principal', 'Independent'),
        defaultValue: 'Independent',
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {}
  );
  Patient.associate = ({ Staff, Dependant, Patient, Insurance, HMO }) => {
    // associations can be defined here
    Patient.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    Patient.hasMany(Dependant, {
      foreignKey: 'patient_id',
    });

    Patient.belongsTo(Insurance, {
      foreignKey: 'insurance_id',
    });

    Patient.belongsTo(HMO, {
      foreignKey: 'hmo_id',
    });

    Patient.hasMany(Patient, {
      foreignKey: 'principal_id',
      as: 'dependants',
    });
  };

  sequelizePaginate.paginate(Patient);
  return Patient;
};
