-- ========================================
-- CREATE COMBO TESTS TABLES (PostgreSQL)
-- ========================================
-- This script creates the Combo_Tests and Combo_Test_Items tables
-- for managing laboratory test combinations
--
-- Database: PostgreSQL
-- ========================================

-- ========================================
-- 1. CREATE COMBO_TESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS "Combo_Tests" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL UNIQUE,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "staff_id" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on Combo_Tests
CREATE INDEX IF NOT EXISTS "idx_combo_tests_name" ON "Combo_Tests" ("name");
CREATE INDEX IF NOT EXISTS "idx_combo_tests_is_active" ON "Combo_Tests" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_combo_tests_staff_id" ON "Combo_Tests" ("staff_id");

-- Add foreign key constraint
ALTER TABLE "Combo_Tests"
  ADD CONSTRAINT "fk_combo_tests_staff"
  FOREIGN KEY ("staff_id")
  REFERENCES "Staff" ("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- ========================================
-- 2. CREATE COMBO_TEST_ITEMS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS "Combo_Test_Items" (
  "id" SERIAL PRIMARY KEY,
  "combo_test_id" INTEGER NOT NULL,
  "test_id" INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on Combo_Test_Items
CREATE INDEX IF NOT EXISTS "idx_combo_test_items_combo_test_id" ON "Combo_Test_Items" ("combo_test_id");
CREATE INDEX IF NOT EXISTS "idx_combo_test_items_test_id" ON "Combo_Test_Items" ("test_id");

-- Add unique constraint
ALTER TABLE "Combo_Test_Items"
  ADD CONSTRAINT "unique_combo_test_item"
  UNIQUE ("combo_test_id", "test_id");

-- Add foreign key constraints
ALTER TABLE "Combo_Test_Items"
  ADD CONSTRAINT "fk_combo_test_items_combo_test"
  FOREIGN KEY ("combo_test_id")
  REFERENCES "Combo_Tests" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "Combo_Test_Items"
  ADD CONSTRAINT "fk_combo_test_items_test"
  FOREIGN KEY ("test_id")
  REFERENCES "Tests" ("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ========================================
-- CREATE TRIGGER FOR UPDATED_AT
-- ========================================
-- PostgreSQL doesn't auto-update timestamps, so we need triggers

-- Function to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_combo_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Combo_Tests
CREATE TRIGGER trigger_combo_tests_updated_at
  BEFORE UPDATE ON "Combo_Tests"
  FOR EACH ROW
  EXECUTE FUNCTION update_combo_tests_updated_at();

-- Trigger for Combo_Test_Items
CREATE TRIGGER trigger_combo_test_items_updated_at
  BEFORE UPDATE ON "Combo_Test_Items"
  FOR EACH ROW
  EXECUTE FUNCTION update_combo_tests_updated_at();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if tables were created successfully
SELECT tablename
FROM pg_tables
WHERE tablename LIKE 'Combo_%'
  AND schemaname = 'public';

-- Describe Combo_Tests table structure
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Combo_Tests'
ORDER BY ordinal_position;

-- Describe Combo_Test_Items table structure
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Combo_Test_Items'
ORDER BY ordinal_position;

-- Show indexes on Combo_Tests
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'Combo_Tests';

-- Show indexes on Combo_Test_Items
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'Combo_Test_Items';

-- Show foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('Combo_Tests', 'Combo_Test_Items');

-- ========================================
-- NOTES
-- ========================================
-- 1. This script creates tables with the following features:
--    - Auto-incrementing primary keys (SERIAL)
--    - Timestamps (createdAt, updatedAt)
--    - Foreign key constraints
--    - Unique constraint on combo_test_id + test_id
--    - Indexes for performance
--    - Triggers for automatic updatedAt timestamp
--
-- 2. Foreign Keys:
--    - Combo_Tests.staff_id -> Staff.id (RESTRICT on delete)
--    - Combo_Test_Items.combo_test_id -> Combo_Tests.id (CASCADE on delete)
--    - Combo_Test_Items.test_id -> Tests.id (CASCADE on delete)
--
-- 3. The unique constraint on Combo_Test_Items prevents duplicate
--    test_id entries within the same combo_test_id
--
-- 4. CASCADE delete ensures that when a combo test is deleted,
--    all its items are automatically deleted
--
-- 5. Triggers automatically update the updatedAt field on record updates
--
-- ========================================
-- DROP TABLES (if needed)
-- ========================================
-- Uncomment the lines below to drop the tables
-- WARNING: This will delete all data!

-- DROP TRIGGER IF EXISTS trigger_combo_test_items_updated_at ON "Combo_Test_Items";
-- DROP TRIGGER IF EXISTS trigger_combo_tests_updated_at ON "Combo_Tests";
-- DROP FUNCTION IF EXISTS update_combo_tests_updated_at();
-- DROP TABLE IF EXISTS "Combo_Test_Items";
-- DROP TABLE IF EXISTS "Combo_Tests";
