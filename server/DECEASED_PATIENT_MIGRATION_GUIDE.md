# Deceased Patient Management System - Database Migration Guide

## Overview

This guide provides comprehensive instructions for migrating the database to support the deceased patient management system. The migration adds all necessary fields, constraints, indexes, and supporting structures.

## Migration Files

### 1. Sequelize Migration (JavaScript)
- **File**: `src/database/migrations/20250128000001-add-deceased-patient-fields.js`
- **Purpose**: Sequelize-compatible migration for automated deployment
- **Usage**: Run with `npm run migration` or `yarn migration`

### 2. Complete SQL Migration
- **File**: `src/database/migrations/20250128000002-deceased-patient-management-complete.sql`
- **Purpose**: Comprehensive SQL migration with all features
- **Usage**: Run directly in MySQL/MariaDB

### 3. Rollback Migration
- **File**: `src/database/migrations/20250128000003-rollback-deceased-patient-fields.sql`
- **Purpose**: Complete rollback of all deceased patient features
- **Usage**: Run to remove all deceased patient functionality

## Database Changes

### New Fields Added to `Patients` Table

| Field Name | Type | Nullable | Description |
|------------|------|----------|-------------|
| `date_of_death` | DATETIME | Yes | Date when the patient passed away |
| `cause_of_death` | VARCHAR(255) | Yes | Cause of death (optional) |
| `death_certificate_number` | VARCHAR(255) | Yes | Auto-generated certificate number |
| `marked_deceased_by` | INT | Yes | Staff ID who marked patient as deceased |
| `marked_deceased_at` | DATETIME | Yes | Timestamp when marked as deceased |
| `revival_reason` | TEXT | Yes | Reason for reviving patient (admin only) |
| `revived_by` | INT | Yes | Staff ID who revived the patient |
| `revived_at` | DATETIME | Yes | Timestamp when patient was revived |

### Foreign Key Constraints

- `FK_Patients_marked_deceased_by_Staff`: Links to `Staff.id`
- `FK_Patients_revived_by_Staff`: Links to `Staff.id`

### Performance Indexes

- `IDX_Patients_patient_status`: For status-based queries
- `IDX_Patients_date_of_death`: For death date queries
- `IDX_Patients_marked_deceased_by`: For staff-based queries
- `IDX_Patients_status_death_date`: Composite index for deceased patient queries
- `IDX_Patients_death_certificate_number`: For certificate lookups

### New Tables

#### `deceased_patient_audit`
Audit trail for all deceased patient management actions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | INT | Primary key |
| `patient_id` | INT | Reference to patient |
| `action` | ENUM | Action performed (MARKED_DECEASED, REVIVED, CERTIFICATE_GENERATED) |
| `performed_by` | INT | Staff member who performed action |
| `performed_at` | DATETIME | Timestamp of action |
| `details` | JSON | Additional action details |
| `ip_address` | VARCHAR(45) | IP address of requester |
| `user_agent` | TEXT | User agent string |

### New Views

#### `deceased_patients_view`
Comprehensive view of deceased patients with staff information.

#### `death_statistics_view`
Monthly death statistics for reporting.

## Migration Instructions

### Option 1: Using Sequelize Migration (Recommended)

```bash
# Navigate to server directory
cd server

# Run the migration
npm run migration
# or
yarn migration
```

### Option 2: Using Direct SQL

```bash
# Connect to your MySQL database
mysql -u username -p database_name

# Run the complete migration
source src/database/migrations/20250128000002-deceased-patient-management-complete.sql
```

### Option 3: Using MySQL Workbench or phpMyAdmin

1. Open the SQL migration file
2. Copy the contents
3. Paste into your MySQL client
4. Execute the script

## Pre-Migration Checklist

- [ ] **Backup Database**: Create a full backup of your database
- [ ] **Test Environment**: Run migration on test environment first
- [ ] **Check Dependencies**: Ensure all required tables exist (`Patients`, `Staff`)
- [ ] **Verify Permissions**: Ensure database user has ALTER, CREATE, INDEX permissions
- [ ] **Check Disk Space**: Ensure sufficient disk space for new indexes
- [ ] **Plan Downtime**: Schedule migration during maintenance window

## Post-Migration Verification

### 1. Verify Table Structure

```sql
-- Check that all columns were added
DESCRIBE Patients;

-- Verify foreign key constraints
SELECT 
  CONSTRAINT_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'Patients' 
  AND CONSTRAINT_NAME LIKE 'FK_Patients_%';
```

### 2. Verify Indexes

```sql
-- Check that indexes were created
SHOW INDEX FROM Patients WHERE Key_name LIKE 'IDX_Patients_%';
```

### 3. Verify Views

```sql
-- Test the views
SELECT * FROM deceased_patients_view LIMIT 5;
SELECT * FROM death_statistics_view LIMIT 5;
```

### 4. Test Application

- [ ] Start the application
- [ ] Test patient creation
- [ ] Test marking patient as deceased
- [ ] Test death certificate generation
- [ ] Test certificate verification
- [ ] Test reporting features

## Rollback Instructions

### If Migration Fails

```bash
# Run the rollback migration
mysql -u username -p database_name < src/database/migrations/20250128000003-rollback-deceased-patient-fields.sql
```

### Manual Rollback Steps

1. **Stop Application**: Stop the Node.js application
2. **Run Rollback SQL**: Execute the rollback migration
3. **Remove Signatures**: Delete the `signatures` directory from server root
4. **Restart Application**: Start the application
5. **Verify**: Ensure application works normally

## Troubleshooting

### Common Issues

#### 1. Foreign Key Constraint Errors

**Error**: `Cannot add foreign key constraint`

**Solution**: Ensure the `Staff` table exists and has the correct structure.

```sql
-- Check Staff table structure
DESCRIBE Staff;

-- Verify Staff table has id column
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Staff' AND COLUMN_NAME = 'id';
```

#### 2. Index Creation Errors

**Error**: `Duplicate key name`

**Solution**: Drop existing indexes before creating new ones.

```sql
-- Check existing indexes
SHOW INDEX FROM Patients;

-- Drop conflicting indexes
DROP INDEX index_name ON Patients;
```

#### 3. Permission Errors

**Error**: `Access denied for user`

**Solution**: Grant necessary permissions to database user.

```sql
-- Grant permissions
GRANT ALTER, CREATE, INDEX ON database_name.* TO 'username'@'host';
FLUSH PRIVILEGES;
```

#### 4. Disk Space Issues

**Error**: `The table is full`

**Solution**: Free up disk space or increase storage.

```sql
-- Check disk usage
SHOW TABLE STATUS LIKE 'Patients';

-- Optimize table
OPTIMIZE TABLE Patients;
```

### Performance Considerations

#### Large Tables

For tables with millions of records:

1. **Run during off-peak hours**
2. **Monitor progress**: Use `SHOW PROCESSLIST` to monitor migration
3. **Consider chunking**: Break large operations into smaller chunks
4. **Increase timeout**: Set longer timeouts for large operations

#### Index Creation

```sql
-- For large tables, create indexes with ALGORITHM=INPLACE
ALTER TABLE Patients ADD INDEX IDX_Patients_patient_status (patient_status) ALGORITHM=INPLACE;
```

## Security Considerations

### Data Protection

- **Encrypt Backups**: Ensure database backups are encrypted
- **Access Control**: Limit database access to authorized personnel
- **Audit Logging**: Enable database audit logging
- **Network Security**: Use secure connections (SSL/TLS)

### Sensitive Data

The deceased patient system handles sensitive medical data:

- **PII Protection**: Ensure compliance with data protection regulations
- **Access Logging**: All deceased patient actions are logged
- **Data Retention**: Implement appropriate data retention policies
- **Encryption**: Consider encrypting sensitive fields

## Monitoring and Maintenance

### Regular Checks

- **Index Performance**: Monitor query performance
- **Disk Usage**: Check for growing signature files
- **Audit Log Size**: Monitor audit table growth
- **Error Logs**: Check application logs for errors

### Maintenance Tasks

```sql
-- Weekly: Optimize tables
OPTIMIZE TABLE Patients;
OPTIMIZE TABLE deceased_patient_audit;

-- Monthly: Clean old audit records (if needed)
DELETE FROM deceased_patient_audit 
WHERE performed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Quarterly: Analyze table statistics
ANALYZE TABLE Patients;
ANALYZE TABLE deceased_patient_audit;
```

## Support and Documentation

### Additional Resources

- **API Documentation**: See the deceased patient API documentation
- **Frontend Guide**: See the frontend integration guide
- **Testing Guide**: See the testing and validation guide

### Getting Help

If you encounter issues:

1. **Check Logs**: Review application and database logs
2. **Verify Migration**: Ensure migration completed successfully
3. **Test Components**: Test individual system components
4. **Contact Support**: Reach out to the development team

## Conclusion

This migration provides a complete foundation for the deceased patient management system. The database structure supports all features including:

- Patient status management
- Death certificate generation
- Digital signature verification
- Comprehensive reporting
- Audit trail maintenance
- Performance optimization

Follow the instructions carefully and always test in a development environment before applying to production.
