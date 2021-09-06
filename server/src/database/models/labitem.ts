import sequelizePaginate from 'sequelize-paginate';

module.exports = (sequelize, DataTypes) => {
  const LabItem = sequelize.define(
    'LabItem',
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
        defaultValue: 0,
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
      expiration: {
        type: DataTypes.DATE,
      },
      staff_id: {
        type: DataTypes.INTEGER,
      },
      date_received: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'Lab_Items',
    }
  );
  LabItem.associate = ({ Staff, Unit }) => {
    // associations can be defined here
    LabItem.belongsTo(Staff, {
      foreignKey: 'staff_id',
    });

    LabItem.belongsTo(Unit, {
      foreignKey: 'unit_id',
      as: 'unit',
    });
  };
  sequelizePaginate.paginate(LabItem);
  return LabItem;
};
