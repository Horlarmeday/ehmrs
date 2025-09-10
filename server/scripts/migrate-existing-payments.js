#!/usr/bin/env node

/**
 * Migration script to create ClinicalPaymentItems for existing payments
 * This script handles the transition from the old system to the new payment-item tracking system
 */

const { Sequelize } = require('sequelize');
const config = require('../src/database/config/config-db.js');

async function migrateExistingPayments() {
  const sequelize = new Sequelize(config);

  try {
    console.log('🔄 Starting migration of existing payments...');

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Get all existing clinical payments
    const [payments] = await sequelize.query(`
      SELECT 
        cp.id,
        cp.bill_id,
        cp.amount,
        cp.payment_method,
        cp.status,
        cp.created_at
      FROM clinical_payments cp
      WHERE cp.id NOT IN (
        SELECT DISTINCT payment_id 
        FROM ClinicalPaymentItems 
        WHERE payment_id IS NOT NULL
      )
      ORDER BY cp.created_at ASC
    `);

    console.log(`📊 Found ${payments.length} payments to migrate`);

    if (payments.length === 0) {
      console.log('✅ No payments need migration');
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const payment of payments) {
      try {
        console.log(`🔄 Migrating payment ${payment.id} (₦${payment.amount})...`);

        // Get bill items for this payment
        const [billItems] = await sequelize.query(
          `
          SELECT 
            cbi.id,
            cbi.item_name,
            cbi.quantity,
            cbi.unit_price,
            cbi.total_price,
            cbi.final_price
          FROM clinical_bill_items cbi
          WHERE cbi.bill_id = ?
          ORDER BY cbi.id ASC
        `,
          {
            replacements: [payment.bill_id],
            type: Sequelize.QueryTypes.SELECT,
          }
        );

        if (billItems.length === 0) {
          console.log(`⚠️  No bill items found for payment ${payment.id}`);
          continue;
        }

        // Calculate how much each item should receive from this payment
        const totalItemsCost = billItems.reduce(
          (sum, item) => sum + parseFloat(item.final_price || item.total_price || 0),
          0
        );
        const paymentRatio = payment.amount / totalItemsCost;

        // Create payment-item records
        const paymentItemRecords = billItems.map(item => {
          const itemCost = parseFloat(item.final_price || item.total_price || 0);
          const amountToPay = itemCost * paymentRatio;
          const status = paymentRatio >= 1 ? 'PAID' : 'PARTIAL';
          const percentage = Math.min(paymentRatio * 100, 100);

          return {
            payment_id: payment.id,
            bill_item_id: item.id,
            amount_paid: Math.round(amountToPay * 100) / 100,
            payment_status: status,
            payment_percentage: Math.round(percentage * 100) / 100,
            notes: `Migration: Payment ${payment.id} - ${status}`,
            created_at: payment.created_at,
            updated_at: new Date(),
          };
        });

        // Insert payment-item records
        await sequelize.query(
          `
          INSERT INTO ClinicalPaymentItems 
          (payment_id, bill_item_id, amount_paid, payment_status, payment_percentage, notes, created_at, updated_at)
          VALUES ${paymentItemRecords.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}
        `,
          {
            replacements: paymentItemRecords.flatMap(record => [
              record.payment_id,
              record.bill_item_id,
              record.amount_paid,
              record.payment_status,
              record.payment_percentage,
              record.notes,
              record.created_at,
              record.updated_at,
            ]),
          }
        );

        console.log(`✅ Migrated payment ${payment.id}: ${paymentItemRecords.length} items`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrating payment ${payment.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} payments`);
    console.log(`❌ Failed migrations: ${errorCount} payments`);
    console.log(`📈 Total processed: ${payments.length} payments`);

    if (errorCount > 0) {
      console.log('\n⚠️  Some payments failed to migrate. Check the logs above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All payments migrated successfully!');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateExistingPayments()
    .then(() => {
      console.log('🏁 Migration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateExistingPayments };
