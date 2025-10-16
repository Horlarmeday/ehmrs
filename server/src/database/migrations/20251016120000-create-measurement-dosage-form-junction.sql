-- Create Measurement_Dosage_Forms junction table
CREATE TABLE IF NOT EXISTS `Measurement_Dosage_Forms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `measurement_id` int(11) NOT NULL,
  `dosage_form_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_measurement_dosage_form` (`measurement_id`, `dosage_form_id`),
  KEY `measurement_dosage_forms_measurement_id_index` (`measurement_id`),
  KEY `measurement_dosage_forms_dosage_form_id_index` (`dosage_form_id`),
  CONSTRAINT `measurement_dosage_forms_measurement_fk` FOREIGN KEY (`measurement_id`) REFERENCES `Measurements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `measurement_dosage_forms_dosage_form_fk` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

