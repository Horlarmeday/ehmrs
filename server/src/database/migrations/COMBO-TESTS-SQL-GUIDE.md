# Combo Tests SQL Scripts - Quick Reference

## Available Scripts

### 📋 Table Creation Scripts

1. **create-combo-tests-tables.sql** (MySQL/MariaDB)
   - Creates `Combo_Tests` and `Combo_Test_Items` tables
   - Includes indexes, foreign keys, and constraints

2. **create-combo-tests-tables-postgres.sql** (PostgreSQL)
   - PostgreSQL version with triggers for auto-updating timestamps
   - Includes all constraints and indexes

### 🌱 Data Seeding Scripts

3. **seed-combo-tests.sql** (Manual)
   - Manual version where you replace test IDs
   - Use when you want precise control over test selection

4. **seed-combo-tests-dynamic.sql** (Dynamic - Recommended)
   - Automatically finds tests by name
   - Easier to use and maintain

### 🚀 All-in-One Script

5. **combo-tests-complete-setup.sql** (MySQL/MariaDB)
   - Creates tables AND seeds data in one go
   - Best for fresh setup

## Quick Start Guide

### Option 1: All-in-One Setup (Easiest)

**Perfect for new installations:**

```bash
# 1. Edit the script
nano combo-tests-complete-setup.sql
# Change: SET @staff_id = 1; (line 14)

# 2. Run it
mysql -u root -p ehmrs_database < combo-tests-complete-setup.sql

# 3. Check results - you'll see verification output at the end
```

### Option 2: Separate Steps

**If tables already exist or you want more control:**

```bash
# Step 1: Create tables (if not using migrations)
mysql -u root -p ehmrs_database < create-combo-tests-tables.sql

# Step 2: Seed data
mysql -u root -p ehmrs_database < seed-combo-tests-dynamic.sql
```

### Option 3: Using Sequelize Migrations

**If you're using the Node.js migrations system:**

```bash
# The migrations are already in the migrations folder
cd server
npm run migration

# Then seed using the dynamic script
mysql -u root -p ehmrs_database < src/database/migrations/seed-combo-tests-dynamic.sql
```

## Prerequisites Checklist

Before running any script:

- [ ] Database is created
- [ ] `Staff` table exists with at least one staff member
- [ ] `Tests` table is populated with individual laboratory tests
- [ ] You have the staff_id ready

## Finding Your Staff ID

```sql
-- Run this to find a valid staff ID
SELECT id, firstname, lastname, email
FROM Staff
LIMIT 5;
```

## Common Test Names

The dynamic scripts look for these test names. Make sure your `Tests` table has similar names:

**Full Blood Count:**
- Hemoglobin
- White Blood Cell Count / WBC Count
- Platelet Count
- Red Blood Cell Count / RBC Count
- Hematocrit

**Lipid Profile:**
- Total Cholesterol / Cholesterol
- HDL Cholesterol / HDL
- LDL Cholesterol / LDL
- Triglycerides

**Liver Function:**
- ALT / Alanine Aminotransferase
- AST / Aspartate Aminotransferase
- ALP / Alkaline Phosphatase
- Total Bilirubin / Bilirubin
- Albumin
- Total Protein

**Renal Function:**
- Creatinine / Serum Creatinine
- Urea / Blood Urea / BUN
- Sodium / Serum Sodium
- Potassium / Serum Potassium
- Chloride / Serum Chloride

**Thyroid Function:**
- TSH / Thyroid Stimulating Hormone
- T3 / Triiodothyronine / Free T3
- T4 / Thyroxine / Free T4

## Verification Queries

After running any script, verify the setup:

```sql
-- Check how many combo tests were created
SELECT COUNT(*) as total_combos FROM Combo_Tests;

-- Check combo tests with test counts
SELECT
  ct.name,
  COUNT(cti.id) as test_count,
  SUM(t.price) as total_price
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
LEFT JOIN Tests t ON cti.test_id = t.id
GROUP BY ct.id
ORDER BY ct.name;

-- Find combos with no tests (need attention)
SELECT ct.name
FROM Combo_Tests ct
LEFT JOIN Combo_Test_Items cti ON ct.id = cti.combo_test_id
GROUP BY ct.id
HAVING COUNT(cti.id) = 0;
```

## Troubleshooting

### Problem: Combo tests created but no items

**Solution:** Test names don't match. Check your test names:

```sql
-- See what test names you actually have
SELECT name FROM Tests ORDER BY name;

-- Update the script to match your exact test names
```

### Problem: Foreign key constraint fails

**Solution:** Staff ID doesn't exist. Find a valid one:

```sql
SELECT id FROM Staff LIMIT 1;
```

### Problem: Duplicate combo test name

**Solution:** Combo already exists. Either:
- Skip it (it's already there)
- Delete and recreate:

```sql
DELETE FROM Combo_Test_Items WHERE combo_test_id IN (
  SELECT id FROM Combo_Tests WHERE name = 'Full Blood Count (FBC)'
);
DELETE FROM Combo_Tests WHERE name = 'Full Blood Count (FBC)';
```

## Database Connection Examples

### MySQL/MariaDB

```bash
# From command line
mysql -u username -p database_name < script.sql

# Interactive
mysql -u username -p
USE database_name;
source /path/to/script.sql;
```

### PostgreSQL

```bash
# From command line
psql -U username -d database_name -f create-combo-tests-tables-postgres.sql

# Interactive
psql -U username -d database_name
\i /path/to/script.sql
```

## File Structure

```
server/src/database/migrations/
├── create-combo-tests-tables.sql              # MySQL table creation
├── create-combo-tests-tables-postgres.sql     # PostgreSQL table creation
├── seed-combo-tests.sql                       # Manual seeding
├── seed-combo-tests-dynamic.sql               # Dynamic seeding (recommended)
├── combo-tests-complete-setup.sql             # All-in-one MySQL setup
├── README-COMBO-TESTS-SEED.md                 # Detailed documentation
└── COMBO-TESTS-SQL-GUIDE.md                   # This quick reference
```

## Need Help?

1. **Check test names:** Make sure your `Tests` table has the expected test names
2. **Verify staff ID:** Ensure the staff_id exists in your `Staff` table
3. **Check output:** The scripts include verification queries that show what was created
4. **Read detailed docs:** See `README-COMBO-TESTS-SEED.md` for comprehensive documentation

## Quick Command Cheat Sheet

```bash
# View available tests
mysql -u root -p -e "SELECT name FROM Tests ORDER BY name" database_name

# Get staff ID
mysql -u root -p -e "SELECT id, firstname, lastname FROM Staff LIMIT 5" database_name

# Run all-in-one setup
mysql -u root -p database_name < combo-tests-complete-setup.sql

# Check results
mysql -u root -p -e "SELECT ct.name, COUNT(cti.id) as tests FROM Combo_Tests ct LEFT JOIN Combo_Test_Items cti ON ct.id=cti.combo_test_id GROUP BY ct.id" database_name

# Clean up (if needed)
mysql -u root -p -e "DELETE FROM Combo_Test_Items; DELETE FROM Combo_Tests;" database_name
```

## Summary

✅ **Fastest Setup:** Use `combo-tests-complete-setup.sql`
✅ **Most Flexible:** Use `seed-combo-tests-dynamic.sql`
✅ **Most Control:** Use `seed-combo-tests.sql` with manual IDs
✅ **For PostgreSQL:** Use the `-postgres.sql` versions
