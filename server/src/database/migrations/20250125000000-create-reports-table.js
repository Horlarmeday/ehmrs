module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      domain: {
        type: Sequelize.ENUM('medical-records', 'pharmacy', 'laboratory', 'accounting'),
        allowNull: false,
      },
      report_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_range_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      date_range_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      filters: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staff',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Reports');
  },
};
