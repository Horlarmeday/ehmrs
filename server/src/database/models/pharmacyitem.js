import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const PharmacyItem = sequelize.define(
    'PharmacyItem',
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
            msg: 'drug is required',
          },
        },
      },
      product_code: {
        type: DataTypes.STRING,
      },
      shelf: {
        type: DataTypes.STRING,
      },
      voucher: {
        type: DataTypes.STRING,
      },
      batch: {
        type: DataTypes.STRING,
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
      remain_quantity: {
        type: DataTypes.INTEGER,
      },
      unit_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'unit is required',
          },
        },
      },
      unit_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'unit price is required',
          },
        },
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
      selling_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'selling price is required',
          },
        },
      },
      expiration: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'expiration date is required',
          },
        },
      },
      dosage_form: {
        type: DataTypes.STRING,
      },
      staff_id: DataTypes.INTEGER,
      date_received: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'date received is required',
          },
        },
      },
      strength: {
        type: DataTypes.STRING,
      },
      strength_input: {
        type: DataTypes.STRING,
      },
      route: {
        type: DataTypes.STRING,
      },
      status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
      drug_type: { type: DataTypes.ENUM('Cash', 'NHIS') },
      drug_form: { type: DataTypes.ENUM('Drug', 'Consumable') },
    },
    {}
  );
  PharmacyItem.associate = ({ Drug, Staff, Unit }) => {
    // associations can be defined here
    PharmacyItem.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    PharmacyItem.belongsTo(Drug, {
      foreignKey: 'drug_id',
      as: 'drug',
    });

    PharmacyItem.belongsTo(Unit, {
      foreignKey: 'unit_id',
      as: 'unit',
    });
  };
  sequelizePaginate.paginate(PharmacyItem);
  return PharmacyItem;
};
