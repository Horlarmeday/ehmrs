-- Create Encounters table
CREATE TABLE `Encounters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `time_of_encounter` datetime NOT NULL,
  `encounter_type` enum('Consultation','Prescription','Lab Order','Radiology Order','Service Order','Triage','Observation','Diagnosis','Admission','Discharge','Ward Round','Clinical Note') DEFAULT NULL,
  `encounter_summary` text,
  `related_entity_type` varchar(255) DEFAULT NULL,
  `related_entity_id` int DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `Encounters_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Encounters_ibfk_2` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Encounters_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add indexes for better performance
CREATE INDEX `idx_encounters_staff_id` ON `Encounters` (`staff_id`);
CREATE INDEX `idx_encounters_visit_id` ON `Encounters` (`visit_id`);
CREATE INDEX `idx_encounters_patient_id` ON `Encounters` (`patient_id`);
CREATE INDEX `idx_encounters_time_of_encounter` ON `Encounters` (`time_of_encounter`);
CREATE INDEX `idx_encounters_encounter_type` ON `Encounters` (`encounter_type`);
CREATE INDEX `idx_encounters_related_entity` ON `Encounters` (`related_entity_type`, `related_entity_id`); 