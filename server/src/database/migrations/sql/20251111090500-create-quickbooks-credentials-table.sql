-- QuickBooks Credentials Table Migration (MariaDB/MySQL)
-- Mirrors 20251111090500-create-quickbooks-credentials-table.js

CREATE TABLE IF NOT EXISTS quickbooks_credentials (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id_encrypted TEXT NOT NULL,
  client_secret_encrypted TEXT NOT NULL,
  redirect_uri VARCHAR(255) NOT NULL,
  environment ENUM('SANDBOX', 'PRODUCTION') NOT NULL DEFAULT 'SANDBOX',
  created_by INT UNSIGNED NOT NULL,
  updated_by INT UNSIGNED NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

