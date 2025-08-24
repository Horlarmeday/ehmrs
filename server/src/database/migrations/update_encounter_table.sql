-- Update existing Encounters table with new fields

-- Add encounter_type enum column
ALTER TABLE `Encounters` 
ADD COLUMN `encounter_type` enum('Consultation','Prescription','Lab Order','Radiology Order','Service Order','Triage','Observation','Diagnosis','Admission','Discharge','Ward Round','Clinical Note') DEFAULT NULL;

-- Add encounter_summary column
ALTER TABLE `Encounters` 
ADD COLUMN `encounter_summary` text DEFAULT NULL;

-- Add related_entity_type column
ALTER TABLE `Encounters` 
ADD COLUMN `related_entity_type` varchar(255) DEFAULT NULL;

-- Add related_entity_id column
ALTER TABLE `Encounters` 
ADD COLUMN `related_entity_id` int DEFAULT NULL;

-- Add metadata column
ALTER TABLE `Encounters` 
ADD COLUMN `metadata` json DEFAULT NULL;

-- Add indexes for better performance on new columns
CREATE INDEX `idx_encounters_encounter_type` ON `Encounters` (`encounter_type`);
CREATE INDEX `idx_encounters_related_entity` ON `Encounters` (`related_entity_type`, `related_entity_id`);

-- Optional: Add comments to document the new fields
ALTER TABLE `Encounters` 
MODIFY COLUMN `encounter_type` enum('Consultation','Prescription','Lab Order','Radiology Order','Service Order','Triage','Observation','Diagnosis','Admission','Discharge','Ward Round','Clinical Note') DEFAULT NULL COMMENT 'Type of encounter';

ALTER TABLE `Encounters` 
MODIFY COLUMN `encounter_summary` text DEFAULT NULL COMMENT 'Summary or notes about the encounter';

ALTER TABLE `Encounters` 
MODIFY COLUMN `related_entity_type` varchar(255) DEFAULT NULL COMMENT 'Type of related entity (e.g., PrescribedDrug, PrescribedTest, Observation)';

ALTER TABLE `Encounters` 
MODIFY COLUMN `related_entity_id` int DEFAULT NULL COMMENT 'ID of the related entity';

ALTER TABLE `Encounters` 
MODIFY COLUMN `metadata` json DEFAULT NULL COMMENT 'Additional context data in JSON format'; 