const { Sequelize } = require('sequelize');
require('dotenv').config();

async function syncDatabase() {
  try {
    // Create Sequelize instance
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
      }
    );

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Import models to register them
    require('./dist/database/models/financialPeriod');
    require('./dist/database/models/patientDeposit');
    require('./dist/database/models/clinicalBill');
    require('./dist/database/models/clinicalPayment');
    require('./dist/database/models/journalEntry');
    require('./dist/database/models/depositTransaction');
    require('./dist/database/models/depositJournalEntry');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully with model changes.');

    // Close connection
    await sequelize.close();
    console.log('✅ Database connection closed.');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase();
