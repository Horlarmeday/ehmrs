'use strict';
import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const NhisOutpatientInventory = sequelize.define(
    'NhisOutpatientInventory',
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
      quantity_received: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'quantity is required',
          },
        },
      },
      shelf: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'unit id is required',
          },
        },
      },
      selling_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'selling price is required',
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
      expiration: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'expiration is required',
          },
        },
      },
      quantity_consumed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dosage_form_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      measurement_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      strength_input: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      drug_form: { type: DataTypes.ENUM('Drug', 'Consumable') },
      quantity_left: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      drug_type: { type: DataTypes.ENUM('Cash', 'NHIS') },
      date_received: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'date received is required',
          },
        },
      },
    },
    {
      tableName: 'Nhis_Outpatient_Inventories',
    }
  );
  NhisOutpatientInventory.associate = ({ Drug, Staff, DosageForm, Measurement, Unit }) => {
    // associations can be defined here
    NhisOutpatientInventory.belongsTo(Drug, {
      foreignKey: 'drug_id',
      as: 'drug',
    });

    NhisOutpatientInventory.belongsTo(Staff, {
      foreignKey: 'staff_id',
      as: 'staff',
    });

    NhisOutpatientInventory.belongsTo(Measurement, {
      foreignKey: 'measurement_id',
      as: 'strength',
    });

    NhisOutpatientInventory.belongsTo(DosageForm, {
      foreignKey: 'dosage_form_id',
      as: 'dosage_form',
    });

    NhisOutpatientInventory.belongsTo(Unit, {
      foreignKey: 'unit_id',
      as: 'unit',
    });
  };
  sequelizePaginate.paginate(NhisOutpatientInventory);
  return NhisOutpatientInventory;
};
