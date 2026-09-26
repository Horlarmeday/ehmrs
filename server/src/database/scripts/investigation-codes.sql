-- #83: catalogue code for investigations so charge.captured carries item_code
-- for all five line types. Backfills INV-#### by ascending id, then makes the
-- column NOT NULL under a unique index. Codes are server-owned.

-- Up Migration
ALTER TABLE `Investigations`
    ADD COLUMN `code` VARCHAR(43) NULL AFTER `name`;

UPDATE `Investigations` i
    JOIN (
        SELECT id, CONCAT('INV-', LPAD(ROW_NUMBER() OVER (ORDER BY id), 4, '0')) AS new_code
        FROM `Investigations`
    ) t ON i.id = t.id
SET i.code = t.new_code;

ALTER TABLE `Investigations`
    MODIFY COLUMN `code` VARCHAR(43) NOT NULL;

CREATE UNIQUE INDEX `uniq_investigations_code` ON `Investigations` (`code`);

-- Down Migration (rollback)
ALTER TABLE `Investigations` DROP INDEX `uniq_investigations_code`;
ALTER TABLE `Investigations` DROP COLUMN `code`;
