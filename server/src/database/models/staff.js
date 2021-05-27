import sequelizePaginate from 'sequelize-paginate';
import bcrypt from 'bcryptjs';

import { sign } from 'jsonwebtoken';

module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define(
    'Staff',
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
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'fullname is required',
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'email is required',
          },
        },
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'department is required',
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
      photo: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'photo is required',
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
      status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'role is required',
          },
        },
      },
      sub_role: {
        type: DataTypes.STRING,
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
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'username is required',
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
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'password is required',
          },
        },
      },
    },
    // {
    //   defaultScope: {
    //     attributes: {
    //       exclude: ['password'],
    //     },
    //   },
    // },
    {
      hooks: {
        // eslint-disable-next-line no-unused-vars
        async beforeCreate(staff, options) {
          const salt = await bcrypt.genSalt(12);
          staff.password = await bcrypt.hash(staff.password, salt);
        },
      },
    },
    {}
  );

  Staff.prototype.generateAuthToken = function() {
    return sign(
      {
        sub: this.id,
        firstname: this.firstname,
        lastname: this.lastname,
        fullname: this.fullname,
        role: this.role,
        username: this.username,
        email: this.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );
  };

  Staff.associate = ({ Patient, Dependant }) => {
    // associations can be defined here
    Staff.hasMany(Patient, {
      foreignKey: 'staff_id',
    });

    Staff.hasMany(Dependant, {
      foreignKey: 'staff_id',
    });
  };

  sequelizePaginate.paginate(Staff);
  return Staff;
};
