module.exports = (sequelize, DataTypes) => {
  const RouteOfAdministration = sequelize.define(
    'RouteOfAdministration',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'name is required',
          },
        },
      },
      staff_id: DataTypes.INTEGER,
      dosage_form_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'dosage form id is required',
          },
        },
      },
    },
    {
      tableName: 'Route_of_Administrations',
    }
  );
  RouteOfAdministration.associate = ({ DosageForm, Staff }) => {
    // associations can be defined here
    RouteOfAdministration.belongsTo(DosageForm, {
      foreignKey: 'dosage_form_id',
      as: 'dosage_form',
    });

    RouteOfAdministration.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });
  };
  return RouteOfAdministration;
};
