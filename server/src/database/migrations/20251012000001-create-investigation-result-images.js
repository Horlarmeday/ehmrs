'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Investigation_Result_Images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      investigation_result_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Investigation_Results',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_type: {
        type: Sequelize.ENUM('DICOM', 'JPEG', 'PNG', 'GIF', 'TIFF'),
        allowNull: false,
        defaultValue: 'JPEG',
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'File size in bytes',
      },
      dicom_metadata: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'DICOM metadata stored as JSON string',
      },
      upload_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Staffs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Indicates if this is the primary/featured image for the result',
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Display order for sorting images',
      },
      original_filename: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Original filename',
      },
      thumbnail_path: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Thumbnail path for quick preview',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Optional description or notes about the image',
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

    // Add index on investigation_result_id for faster lookups
    await queryInterface.addIndex('Investigation_Result_Images', ['investigation_result_id'], {
      name: 'idx_investigation_result_images_result_id',
    });

    // Add index on uploaded_by for audit tracking
    await queryInterface.addIndex('Investigation_Result_Images', ['uploaded_by'], {
      name: 'idx_investigation_result_images_uploaded_by',
    });

    // Add index on is_primary for quick primary image lookup
    await queryInterface.addIndex(
      'Investigation_Result_Images',
      ['investigation_result_id', 'is_primary'],
      {
        name: 'idx_investigation_result_images_primary',
      }
    );

    // Add index on display_order for sorting
    await queryInterface.addIndex(
      'Investigation_Result_Images',
      ['investigation_result_id', 'display_order'],
      {
        name: 'idx_investigation_result_images_order',
      }
    );

    // Add index on file_type for filtering DICOM vs regular images
    await queryInterface.addIndex('Investigation_Result_Images', ['file_type'], {
      name: 'idx_investigation_result_images_file_type',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Investigation_Result_Images');
  },
};
