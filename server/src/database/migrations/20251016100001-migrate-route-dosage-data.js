module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get all existing routes with their dosage_form_id
    const routes = await queryInterface.sequelize.query(
      'SELECT id, dosage_form_id FROM Route_of_Administrations WHERE dosage_form_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`Migrating ${routes.length} route-dosage form associations...`);

    // Insert associations into the junction table
    if (routes.length > 0) {
      const associations = routes.map(route => ({
        route_id: route.id,
        dosage_form_id: route.dosage_form_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert('Route_Dosage_Forms', associations);
    }

    // Verify migration
    const [
      originalCount,
    ] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM Route_of_Administrations WHERE dosage_form_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const [migratedCount] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM Route_Dosage_Forms',
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log(`Original associations: ${originalCount.count}`);
    console.log(`Migrated associations: ${migratedCount.count}`);

    if (originalCount.count !== migratedCount.count) {
      throw new Error('Data migration verification failed: counts do not match');
    }

    console.log('Data migration completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Clear the junction table
    await queryInterface.bulkDelete('Route_Dosage_Forms', null, {});
    console.log('Rolled back route-dosage form associations');
  },
};
