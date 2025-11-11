-- QuickBooks Connections Table Migration (MariaDB/MySQL)
-- Mirrors 20251111090000-create-quickbooks-connections-table.js

CREATE TABLE IF NOT EXISTS quickbooks_connections (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  realm_id VARCHAR(100) NOT NULL,
  environment ENUM('SANDBOX', 'PRODUCTION') NOT NULL DEFAULT 'SANDBOX',
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  access_token_expires_at DATETIME NOT NULL,
  refresh_token_expires_at DATETIME NOT NULL,
  last_synced_at DATETIME NULL,
  connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  disconnected_at DATETIME NULL,
  is_connected TINYINT(1) NOT NULL DEFAULT 1,
  created_by INT UNSIGNED NOT NULL,
  updated_by INT UNSIGNED NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY quickbooks_connections_realm_id_unique (realm_id),
  KEY quickbooks_connections_is_connected_idx (is_connected)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

