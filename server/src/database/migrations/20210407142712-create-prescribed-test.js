module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Prescribed_Tests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      test_id: {
        type: Sequelize.INTEGER,
      },
      nhis_test_id: {
        type: Sequelize.INTEGER,
      },
      test_type: {
        type: Sequelize.STRING,
        defaultValue: 'CASH',
        allowNull: false,
      },
      requester: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      visit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date_requested: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      payment_status: {
        type: Sequelize.ENUM('Pending', 'Cleared', 'Paid'),
        defaultValue: 'Pending',
      },
      is_test_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      test_verified_date: {
        type: Sequelize.DATE,
      },
      is_test_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      test_approved_date: {
        type: Sequelize.DATE,
      },
      test_verified_by: {
        type: Sequelize.INTEGER,
      },
      test_approved_by: {
        type: Sequelize.INTEGER,
      },
      is_nhis_test_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    return queryInterface.dropTable('Prescribed_Tests');
  },
};
