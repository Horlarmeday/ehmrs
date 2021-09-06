import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Dependant = sequelize.define(
    'Dependant',
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
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'date of birth is required',
          },
        },
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
      relationship: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'relationship is required',
          },
        },
      },
      hospital_id: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      photo: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'photo is required',
          },
        },
      },
      photo_url: {
        type: DataTypes.TEXT,
      },
      insurance_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            notEmpty: {
              msg: 'insurance id is required',
            },
          },
        },
      },
      hmo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            notEmpty: {
              msg: 'hmo id is required',
            },
          },
        },
      },
      enrollee_code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'enrollee id is required',
          },
        },
      },
      plan: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'plan is required',
          },
        },
      },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
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
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'address is required',
          },
        },
      },
    },
    {}
  );
  Dependant.associate = ({ Staff, Patient }) => {
    // associations can be defined here
    Dependant.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    Dependant.belongsTo(Patient, {
      foreignKey: 'patient_id',
    });
  };

  sequelizePaginate.paginate(Dependant);
  return Dependant;
};
