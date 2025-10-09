module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Lab_Form_Template_Versions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        template_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Lab_Form_Templates',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        version: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        schema_json: {
          type: Sequelize.JSON,
          allowNull: false,
          comment: 'Historical JSON schema for this version',
        },
        pdf_config: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Historical PDF configuration for this version',
        },
        change_notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Description of changes made in this version',
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
      .then(() => {
        // Create unique constraint for template_id + version combination
        return queryInterface.addConstraint('Lab_Form_Template_Versions', {
          fields: ['template_id', 'version'],
          type: 'unique',
          name: 'unique_template_version',
        });
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Lab_Form_Template_Versions');
  },
};
