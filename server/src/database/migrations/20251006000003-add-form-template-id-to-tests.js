module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn('Tests', 'form_template_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Lab_Form_Templates',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Foreign key to Lab_Form_Templates - replaces result_form string',
      })
      .then(() => {
        // Add index for performance
        return queryInterface.addIndex('Tests', ['form_template_id'], {
          name: 'idx_tests_form_template_id',
        });
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Tests', 'form_template_id');
  },
};
