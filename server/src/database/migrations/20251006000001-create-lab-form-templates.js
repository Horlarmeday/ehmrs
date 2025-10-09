module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('Lab_Form_Templates', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        category: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'e.g., Hematology, Chemistry, Microbiology, etc.',
        },
        schema_json: {
          type: Sequelize.JSON,
          allowNull: false,
          comment: 'JSON schema defining form structure and fields',
        },
        pdf_config: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Configuration for PDF generation layout',
        },
        version: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: '1.0',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        is_system_template: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'System templates cannot be deleted',
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Staff',
            key: 'id',
          },
        },
        updated_by: {
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
        // Create indexes for better performance
        return Promise.all([
          queryInterface.addIndex('Lab_Form_Templates', ['code'], {
            name: 'idx_lab_form_templates_code',
          }),
          queryInterface.addIndex('Lab_Form_Templates', ['is_active'], {
            name: 'idx_lab_form_templates_active',
          }),
          queryInterface.addIndex('Lab_Form_Templates', ['category'], {
            name: 'idx_lab_form_templates_category',
          }),
        ]);
      });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Lab_Form_Templates');
  },
};
