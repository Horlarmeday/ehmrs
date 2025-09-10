'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1. Add period_id to patient_deposits table
      await queryInterface.addColumn(
        'patient_deposits',
        'period_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'financial_periods',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction }
      );

      // 2. Add period_id to clinical_bills table
      await queryInterface.addColumn(
        'clinical_bills',
        'period_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'financial_periods',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction }
      );

      // 3. Add period_id to clinical_payments table
      await queryInterface.addColumn(
        'clinical_payments',
        'period_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'financial_periods',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        { transaction }
      );

      // 4. Add period_id to journal_entries table (if it exists)
      try {
        await queryInterface.addColumn(
          'journal_entries',
          'period_id',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'financial_periods',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      } catch (error) {
        // Journal entries table might not exist yet, skip silently
        console.log('Journal entries table not found, skipping period_id addition');
      }

      // 5. Add period_id to deposit_transactions table (if it exists)
      try {
        await queryInterface.addColumn(
          'deposit_transactions',
          'period_id',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'financial_periods',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      } catch (error) {
        // Deposit transactions table might not exist yet, skip silently
        console.log('Deposit transactions table not found, skipping period_id addition');
      }

      // 6. Add period_id to deposit_journal_entries table (if it exists)
      try {
        await queryInterface.addColumn(
          'deposit_journal_entries',
          'period_id',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'financial_periods',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      } catch (error) {
        // Deposit journal entries table might not exist yet, skip silently
        console.log('Deposit journal entries table not found, skipping period_id addition');
      }

      // 7. Add indexes for better performance
      await queryInterface.addIndex('patient_deposits', ['period_id'], { transaction });
      await queryInterface.addIndex('clinical_bills', ['period_id'], { transaction });
      await queryInterface.addIndex('clinical_payments', ['period_id'], { transaction });

      // 8. Create a default financial period if none exists
      const existingPeriods = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM financial_periods',
        { type: Sequelize.QueryTypes.SELECT, transaction }
      );

      if (existingPeriods[0].count === 0) {
        // Create a default period for existing data
        const defaultPeriod = await queryInterface.bulkInsert(
          'financial_periods',
          [
            {
              name: 'Default Period - Existing Data',
              start_date: new Date('2024-01-01'),
              end_date: new Date('2024-12-31'),
              status: 'OPEN',
              balance: 0,
              notes: 'Default period created for existing financial data',
              created_by: 1, // Assuming admin user ID is 1
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          { transaction }
        );

        const defaultPeriodId = defaultPeriod[0];

        // Update existing records to use the default period
        await queryInterface.sequelize.query(
          'UPDATE patient_deposits SET period_id = ? WHERE period_id IS NULL',
          {
            replacements: [defaultPeriodId],
            type: Sequelize.QueryTypes.UPDATE,
            transaction,
          }
        );

        await queryInterface.sequelize.query(
          'UPDATE clinical_bills SET period_id = ? WHERE period_id IS NULL',
          {
            replacements: [defaultPeriodId],
            type: Sequelize.QueryTypes.UPDATE,
            transaction,
          }
        );

        await queryInterface.sequelize.query(
          'UPDATE clinical_payments SET period_id = ? WHERE period_id IS NULL',
          {
            replacements: [defaultPeriodId],
            type: Sequelize.QueryTypes.UPDATE,
            transaction,
          }
        );

        // Update other tables if they exist
        try {
          await queryInterface.sequelize.query(
            'UPDATE journal_entries SET period_id = ? WHERE period_id IS NULL',
            {
              replacements: [defaultPeriodId],
              type: Sequelize.QueryTypes.UPDATE,
              transaction,
            }
          );
        } catch (error) {
          // Table might not exist, skip silently
        }

        try {
          await queryInterface.sequelize.query(
            'UPDATE deposit_transactions SET period_id = ? WHERE period_id IS NULL',
            {
              replacements: [defaultPeriodId],
              type: Sequelize.QueryTypes.UPDATE,
              transaction,
            }
          );
        } catch (error) {
          // Table might not exist, skip silently
        }

        try {
          await queryInterface.sequelize.query(
            'UPDATE deposit_journal_entries SET period_id = ? WHERE period_id IS NULL',
            {
              replacements: [defaultPeriodId],
              type: Sequelize.QueryTypes.UPDATE,
              transaction,
            }
          );
        } catch (error) {
          // Table might not exist, skip silently
        }
      }

      await transaction.commit();
      console.log('✅ Successfully added financial period connections to all financial tables');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Failed to add financial period connections:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Remove period_id columns from all tables
      await queryInterface.removeColumn('patient_deposits', 'period_id', { transaction });
      await queryInterface.removeColumn('clinical_bills', 'period_id', { transaction });
      await queryInterface.removeColumn('clinical_payments', 'period_id', { transaction });

      // Remove from other tables if they exist
      try {
        await queryInterface.removeColumn('journal_entries', 'period_id', { transaction });
      } catch (error) {
        // Table might not exist, skip silently
      }

      try {
        await queryInterface.removeColumn('deposit_transactions', 'period_id', { transaction });
      } catch (error) {
        // Table might not exist, skip silently
      }

      try {
        await queryInterface.removeColumn('deposit_journal_entries', 'period_id', { transaction });
      } catch (error) {
        // Table might not exist, skip silently
      }

      await transaction.commit();
      console.log('✅ Successfully removed financial period connections from all financial tables');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Failed to remove financial period connections:', error);
      throw error;
    }
  },
};
