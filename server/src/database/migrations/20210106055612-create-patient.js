module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Patients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      middlename: {
        type: Sequelize.STRING,
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female', 'Other'),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alt_phone: {
        type: Sequelize.STRING,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lga: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hospital_id: {
        type: Sequelize.STRING,
      },
      occupation: {
        type: Sequelize.STRING,
      },
      next_of_kin_name: {
        type: Sequelize.STRING,
      },
      next_of_kin_phone: {
        type: Sequelize.STRING,
      },
      next_of_kin_address: {
        type: Sequelize.TEXT,
      },
      relationship: {
        type: Sequelize.STRING,
      },
      photo: {
        type: Sequelize.TEXT,
      },
      photo_url: {
        type: Sequelize.TEXT,
      },
      date_of_birth: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      insurance_id: {
        type: Sequelize.INTEGER,
      },
      hmo_id: {
        type: Sequelize.INTEGER,
      },
      enrollee_code: {
        type: Sequelize.STRING,
      },
      marital_status: {
        type: Sequelize.STRING,
      },
      religion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
      },
      staff_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING,
      },
      plan: {
        type: Sequelize.STRING,
      },
      has_insurance: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      fullname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      principal_id: {
        type: Sequelize.INTEGER,
      },
      patient_type: {
        type: Sequelize.ENUM('Dependant', 'Principal', 'Independent'),
        allowNull: false,
        defaultValue: 'Independent',
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
    return queryInterface.dropTable('Patients');
  },
};
