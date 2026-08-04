-- Up Migration
CREATE TABLE `Outbox_Events` (
                                 `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 `aggregate_type` VARCHAR(64) NOT NULL,
                                 `aggregate_id` VARCHAR(64) NOT NULL,
                                 `sequence` BIGINT NOT NULL,
                                 `event_type` VARCHAR(64) NOT NULL,
                                 `event_version` INT NOT NULL DEFAULT 1,
                                 `idempotency_key` VARCHAR(200) NOT NULL UNIQUE,
                                 `payload` JSON NOT NULL,
                                 `sent_at` DATETIME NULL,
                                 `attempts` INT NOT NULL DEFAULT 0,
                                 `last_error` TEXT NULL,
                                 `createdAt` DATETIME NOT NULL,
                                 `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for unsent rows (drainer's primary query)
-- Leading with sent_at keeps the scan proportional to the backlog
CREATE INDEX `idx_outbox_events_unsent` ON `Outbox_Events` (`sent_at`, `id`);

-- Sequences Table
CREATE TABLE `Outbox_Sequences` (
                                    `aggregate_id` VARCHAR(64) NOT NULL PRIMARY KEY,
                                    `last_sequence` BIGINT NOT NULL DEFAULT 0,
                                    `createdAt` DATETIME NOT NULL,
                                    `updatedAt` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Down Migration (rollback)
DROP TABLE IF EXISTS `Outbox_Events`;
DROP TABLE IF EXISTS `Outbox_Sequences`;