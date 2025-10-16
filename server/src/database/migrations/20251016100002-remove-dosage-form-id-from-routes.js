module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verify that data has been migrated
    const [
      routesCount,
    ] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM Route_of_Administrations WHERE dosage_form_id IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const [junctionCount] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM Route_Dosage_Forms',
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    console.log(`Routes with dosage_form_id: ${routesCount.count}`);
    console.log(`Junction table records: ${junctionCount.count}`);

    if (routesCount.count > 0 && junctionCount.count === 0) {
      throw new Error(
        'Cannot remove dosage_form_id column: data has not been migrated to junction table. ' +
          'Please run the previous migration first.'
      );
    }

    // Remove the foreign key constraint first (if it exists)
    try {
      await queryInterface.removeConstraint(
        'Route_of_Administrations',
        'Route_of_Administrations_ibfk_1'
      );
    } catch (error) {
      console.log('Foreign key constraint not found or already removed');
    }

    // Remove the dosage_form_id column
    await queryInterface.removeColumn('Route_of_Administrations', 'dosage_form_id');

    console.log('Successfully removed dosage_form_id column from Route_of_Administrations');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the dosage_form_id column
    await queryInterface.addColumn('Route_of_Administrations', 'dosage_form_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow null during restoration
      references: {
        model: 'Dosage_Forms',
        key: 'id',
      },
    });

    // Restore data from junction table (only the first association for each route)
    await queryInterface.sequelize.query(`
      UPDATE Route_of_Administrations r
      INNER JOIN (
        SELECT route_id, MIN(dosage_form_id) as dosage_form_id
        FROM Route_Dosage_Forms
        GROUP BY route_id
      ) rdf ON r.id = rdf.route_id
      SET r.dosage_form_id = rdf.dosage_form_id
    `);

    console.log('Restored dosage_form_id column (with first association per route)');
  },
};
