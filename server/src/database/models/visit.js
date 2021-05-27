import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const Visit = sequelize.define(
    'Visit',
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
      date_visit_ended: {
        type: DataTypes.DATE,
      },
      type: {
        type: DataTypes.ENUM('IPD', 'OPD', 'Emergency'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'visit type is required',
          },
        },
      },
      staff_id: DataTypes.INTEGER,
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {}
  );
  Visit.associate = ({ Patient, Staff }) => {
    // associations can be defined here
    Visit.belongsTo(Patient, {
      foreignKey: 'patient_id',
      as: 'patient',
    });

    Visit.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };

  sequelizePaginate.paginate(Visit);
  return Visit;
};
