-- Up Migration
CREATE TABLE `Inbox_Events` (
                                `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                `event_id` VARCHAR(64) NOT NULL UNIQUE,
                                `idempotency_key` VARCHAR(200) NOT NULL UNIQUE,
                                `event_type` VARCHAR(64) NOT NULL,
                                `event_version` INT NOT NULL DEFAULT 1,
                                `aggregate_type` VARCHAR(64) NOT NULL,
                                `aggregate_id` VARCHAR(64) NOT NULL,
                                `sequence` BIGINT NOT NULL,
                                `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING',
                                `payload` JSON NOT NULL,
                                `key_id` VARCHAR(64) NOT NULL,
                                `processed_at` DATETIME NULL,
                                `attempts` INT NOT NULL DEFAULT 0,
                                `createdAt` DATETIME NOT NULL,
                                `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for pending rows (drainer's primary query)
CREATE INDEX `idx_inbox_events_pending` ON `Inbox_Events` (`status`, `id`);

-- Index for aggregate gap detection
CREATE INDEX `idx_inbox_events_aggregate` ON `Inbox_Events` (`aggregate_type`, `aggregate_id`, `sequence`);

-- Dead Letters Table
CREATE TABLE `Inbox_Dead_Letters` (
                                      `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                      `event_id` VARCHAR(64) NULL,
                                      `event_type` VARCHAR(64) NULL,
                                      `idempotency_key` VARCHAR(200) NULL,
                                      `reason` VARCHAR(64) NOT NULL,
                                      `detail` TEXT NOT NULL,
                                      `payload` JSON NOT NULL,
                                      `inbox_event_id` BIGINT NULL,
                                      `createdAt` DATETIME NOT NULL,
                                      `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sequences Table
CREATE TABLE `Inbox_Sequences` (
                                   `aggregate_id` VARCHAR(64) NOT NULL PRIMARY KEY,
                                   `last_applied_sequence` BIGINT NOT NULL DEFAULT 0,
                                   `createdAt` DATETIME NOT NULL,
                                   `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration (rollback)
DROP TABLE IF EXISTS `Inbox_Events`;
DROP TABLE IF EXISTS `Inbox_Dead_Letters`;
DROP TABLE IF EXISTS `Inbox_Sequences`;