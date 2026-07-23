-- EHMRS test-database schema (structure only, no data).
--
-- The canonical schema the Jest integration suite runs against. The repo's Sequelize
-- migrations reproduce only ~36 of the ~94 live tables (the migration history was
-- abandoned; the schema evolved by other means), so a migrated database cannot run the
-- tests. This snapshot fills that gap until the migrations are regenerated.
--
-- Refresh with: yarn test:db:dump  (see README).  Load with: yarn test:db:setup.
-- Contains NO patient data - table structure and routines only.

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Additional_item_prescriptions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Additional_item_prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `drug_type` enum('Cash','NHIS','Private','Plaschema','Retainership') NOT NULL,
  `quantity_prescribed` int NOT NULL,
  `quantity_to_dispense` int NOT NULL,
  `quantity_returned` int DEFAULT '0',
  `quantity_dispensed` int DEFAULT '0',
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `dispense_status` enum('Dispensed','Pending','Returned','Partial Dispense','Partial Returned') NOT NULL DEFAULT 'Pending',
  `payment_status` enum('Cleared','Paid','Pending','Permitted') NOT NULL DEFAULT 'Pending',
  `billing_status` enum('Billed','Unbilled') NOT NULL DEFAULT 'Unbilled',
  `examiner` int NOT NULL,
  `date_prescribed` datetime NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `prescribed_drug_id` int DEFAULT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `unit_id` int NOT NULL,
  `dispensed_by` int DEFAULT NULL,
  `returned_by` int DEFAULT NULL,
  `inventory_id` int NOT NULL,
  `drug_prescription_id` int DEFAULT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `surgery_id` int DEFAULT NULL,
  `source` enum('Antenatal','Consultation','Theater','Immunization') DEFAULT 'Consultation',
  `nhis_status` enum('Approved','Declined','Pending') DEFAULT 'Pending',
  `reason_for_return` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `old_id` int DEFAULT NULL,
  `nhis_item_processed_by` int DEFAULT NULL,
  `date_nhis_item_processed` datetime DEFAULT NULL,
  `date_dispensed` datetime DEFAULT NULL,
  `date_returned` datetime DEFAULT NULL,
  `original_total_price` int DEFAULT NULL,
  `collected_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `drug_id` (`drug_id`),
  KEY `examiner` (`examiner`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `prescribed_drug_id` (`prescribed_drug_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  KEY `unit_id` (`unit_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `drug_prescription_id` (`drug_prescription_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `surgery_id` (`surgery_id`),
  KEY `Additional_item_prescriptions_ibfk_111` (`nhis_item_processed_by`),
  CONSTRAINT `additional_item_prescriptions_ibfk_100` FOREIGN KEY (`drug_id`) REFERENCES `Drugs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_101` FOREIGN KEY (`examiner`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_102` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_103` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_104` FOREIGN KEY (`prescribed_drug_id`) REFERENCES `Prescribed_Drugs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_105` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_106` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_107` FOREIGN KEY (`inventory_id`) REFERENCES `Inventories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_108` FOREIGN KEY (`drug_prescription_id`) REFERENCES `Drug_Prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_109` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_item_prescriptions_ibfk_110` FOREIGN KEY (`surgery_id`) REFERENCES `Surgery_Requests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Additional_item_prescriptions_ibfk_111` FOREIGN KEY (`nhis_item_processed_by`) REFERENCES `Staffs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=195098 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Additional_Treatments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Additional_Treatments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug` text NOT NULL,
  `dosage_administered` text,
  `quantity` int NOT NULL,
  `remarks` text,
  `staff_id` int NOT NULL,
  `date_entered` datetime NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `admission_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  CONSTRAINT `additional_treatments_ibfk_17` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_treatments_ibfk_18` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_treatments_ibfk_19` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `additional_treatments_ibfk_20` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Admissions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ward_id` int NOT NULL,
  `bed_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `admitted_by` int DEFAULT NULL,
  `discharge_status` enum('Discharged','On Admission') DEFAULT 'On Admission',
  `previous_ward` int DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `should_discharge` tinyint(1) DEFAULT '0',
  `discharge_recommended_by` int DEFAULT NULL,
  `discharged_by` int DEFAULT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `date_admitted` datetime NOT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ward_id` (`ward_id`),
  KEY `bed_id` (`bed_id`),
  KEY `visit_id` (`visit_id`),
  KEY `admitted_by` (`admitted_by`),
  KEY `previous_ward` (`previous_ward`),
  KEY `discharge_recommended_by` (`discharge_recommended_by`),
  KEY `discharged_by` (`discharged_by`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  CONSTRAINT `admissions_ibfk_131` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_132` FOREIGN KEY (`ward_id`) REFERENCES `Wards` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_133` FOREIGN KEY (`bed_id`) REFERENCES `beds` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_134` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_135` FOREIGN KEY (`admitted_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_136` FOREIGN KEY (`previous_ward`) REFERENCES `Wards` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_137` FOREIGN KEY (`discharge_recommended_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_138` FOREIGN KEY (`discharged_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_139` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `admissions_ibfk_140` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Alerts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `alert` text,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `alerts_ibfk_25` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `alerts_ibfk_26` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Allergies`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Allergies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `notes` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `allergies_ibfk_25` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `allergies_ibfk_26` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Antenatal_Accounts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Antenatal_Accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `antenatal_number` varchar(255) DEFAULT NULL,
  `parity` varchar(255) DEFAULT NULL,
  `gravida` varchar(255) DEFAULT NULL,
  `last_menses_period` datetime DEFAULT NULL,
  `estimated_delivery_date` datetime DEFAULT NULL,
  `estimated_concept_time` datetime DEFAULT NULL,
  `fetal_age` varchar(255) DEFAULT NULL,
  `medical_history` text,
  `family_history` json DEFAULT NULL,
  `blood_transfusion_history` text,
  `surgical_history` text,
  `staff_id` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `account_status` enum('ACTIVE','INACTIVE','COMPLETED','DISCONTINUED') DEFAULT 'INACTIVE',
  `for_whom` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `antenatal_accounts_ibfk_21` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_accounts_ibfk_22` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3211 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Antenatal_Observations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Antenatal_Observations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ante_natal_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `mother_condition` text NOT NULL,
  `foetal_condition` text NOT NULL,
  `continuation_sheet` text NOT NULL,
  `doctor_comments` text NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  CONSTRAINT `antenatal_observations_ibfk_39` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_observations_ibfk_40` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_observations_ibfk_41` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_observations_ibfk_42` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2435 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Antenatal_Triages`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Antenatal_Triages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ante_natal_id` int NOT NULL,
  `visit_id` int DEFAULT NULL,
  `weight` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `body_mass_index` varchar(255) DEFAULT NULL,
  `urinalysis_protein` varchar(255) DEFAULT NULL,
  `urinalysis_glucose` varchar(255) DEFAULT NULL,
  `pallor` varchar(255) DEFAULT NULL,
  `blood_pressure` varchar(255) DEFAULT NULL,
  `maturity` varchar(255) DEFAULT NULL,
  `oedema` varchar(255) DEFAULT NULL,
  `presentation` varchar(255) DEFAULT NULL,
  `foetal_heart_rate` varchar(255) DEFAULT NULL,
  `fundal_height` varchar(255) DEFAULT NULL,
  `rvst` varchar(255) DEFAULT NULL,
  `comments` text,
  `next_appointment_date` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `antenatal_triages_ibfk_49` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_triages_ibfk_50` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_triages_ibfk_51` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `antenatal_triages_ibfk_52` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16609 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `beds`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bed_type` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `status` enum('Taken','Untaken') NOT NULL DEFAULT 'Untaken',
  `staff_id` int DEFAULT NULL,
  `ward_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ward_id` (`ward_id`),
  CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`ward_id`) REFERENCES `Wards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Care_Plans`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Care_Plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `evaluation` text,
  `scientific_principle` text,
  `nursing_objective` text,
  `nursing_action` text,
  `nursing_diagnosis` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `care_plans_ibfk_49` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `care_plans_ibfk_50` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `care_plans_ibfk_51` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `care_plans_ibfk_52` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Chart_of_Account`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Chart_of_Account` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('ASSET','LIABILITY','EQUITY','INCOME','EXPENSE') NOT NULL,
  `description` text,
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `balance` decimal(10,2) DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Clinical_Notes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Clinical_Notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ante_natal_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `notes` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `clinical_notes_ibfk_49` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `clinical_notes_ibfk_50` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `clinical_notes_ibfk_51` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `clinical_notes_ibfk_52` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3065 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Complaints`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Complaints` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint` text NOT NULL,
  `frequency` enum('Minutes','Hours','Days','Weeks','Months','Years') NOT NULL,
  `notes` text,
  `frequency_number` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `visit_id` int DEFAULT NULL,
  `patient_id` int NOT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  CONSTRAINT `complaints_ibfk_49` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_50` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_51` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `complaints_ibfk_52` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Cost_Centers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cost_Centers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `department_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `department_id` (`department_id`),
  CONSTRAINT `cost_centers_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Defaults`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Defaults` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('ANC_ROUTINE_TESTS','DIALYSIS_ITEMS','ANC_ROUTINE_DRUGS','ADMISSION_ITEMS','INJECTION_ITEMS','OPERATION_ITEMS','WATER_INJECTIONS','CIRCUMCISION_ROUTINE_DRUGS','HSG_ADDITIONAL_ITEMS') NOT NULL,
  `data` json DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `defaults_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Deliveries`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Deliveries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `condition_of_mother` text NOT NULL,
  `condition_of_baby` text NOT NULL,
  `mode_of_delivery` varchar(255) NOT NULL,
  `date_of_delivery` datetime NOT NULL,
  `time_surgery_ended` datetime DEFAULT NULL,
  `blood_loss_quantity` varchar(255) DEFAULT NULL,
  `apgar_one_min` varchar(255) DEFAULT NULL,
  `apgar_five_min` varchar(255) DEFAULT NULL,
  `apgar_ten_min` varchar(255) DEFAULT NULL,
  `birth_weight` varchar(255) DEFAULT NULL,
  `sex` varchar(255) DEFAULT NULL,
  `vitaminA_IU` varchar(255) DEFAULT NULL,
  `nature_of_liquor` varchar(255) DEFAULT NULL,
  `nevirapine` varchar(255) DEFAULT NULL,
  `bcg` varchar(255) DEFAULT NULL,
  `opvo` varchar(255) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `hbv` varchar(255) DEFAULT NULL,
  `comments` text,
  `baby_immunization_date` datetime DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `deliveries_ibfk_61` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `deliveries_ibfk_62` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `deliveries_ibfk_63` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `deliveries_ibfk_64` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `deliveries_ibfk_65` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Departments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Dependants`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dependants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `date_of_birth` datetime NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `relationship` varchar(255) NOT NULL,
  `hospital_id` varchar(255) NOT NULL,
  `photo` text NOT NULL,
  `photo_url` text,
  `insurance_id` int NOT NULL,
  `hmo_id` int NOT NULL,
  `enrollee_code` varchar(255) NOT NULL,
  `plan` varchar(255) NOT NULL,
  `staff_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Diagnoses`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Diagnoses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `diagnosis_id` int NOT NULL,
  `certainty` enum('Confirmed','Presumed') NOT NULL,
  `notes` text,
  `type` enum('ICD10','ICPC2') NOT NULL,
  `visit_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `patient_id` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `diagnosis_id` (`diagnosis_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  CONSTRAINT `diagnoses_ibfk_1` FOREIGN KEY (`visit_id`) REFERENCES `visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `diagnoses_ibfk_11` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `diagnoses_ibfk_12` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `diagnoses_ibfk_13` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36975 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Discharges`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Discharges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ward_id` int NOT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `discharged_by` int NOT NULL,
  `discharge_type` enum('Discharge','Death','Lama','Refer','Absconded','Transfer') NOT NULL,
  `date_discharged` datetime NOT NULL,
  `conditions_of_patient` text,
  `transfer_location` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ward_id` (`ward_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `discharged_by` (`discharged_by`),
  CONSTRAINT `discharges_ibfk_61` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `discharges_ibfk_62` FOREIGN KEY (`ward_id`) REFERENCES `Wards` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `discharges_ibfk_63` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `discharges_ibfk_64` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `discharges_ibfk_65` FOREIGN KEY (`discharged_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Dosage_Forms`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Dosage_Forms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `dosage_forms_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Drug_Prescriptions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Drug_Prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` enum('Antenatal','Consultation','Theater','Immunization') DEFAULT 'Consultation',
  `requester` int DEFAULT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `date_prescribed` datetime NOT NULL,
  `is_billed` tinyint(1) DEFAULT '0',
  `has_paid` tinyint(1) DEFAULT '0',
  `status` enum('Pending','Complete Dispense','Partial Dispense') NOT NULL DEFAULT 'Pending',
  `ante_natal_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `requester` (`requester`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  CONSTRAINT `drug_prescriptions_ibfk_37` FOREIGN KEY (`requester`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `drug_prescriptions_ibfk_38` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `drug_prescriptions_ibfk_39` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `drug_prescriptions_ibfk_40` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7460 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Drug_Tariffs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Drug_Tariffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hmo_id` int DEFAULT NULL,
  `drug_id` int NOT NULL,
  `insurance_id` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `drug_tariffs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Drugs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Drugs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('Drug','Consumable') NOT NULL,
  `code` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `is_available_for_nhis` tinyint(1) DEFAULT NULL,
  `old_id` int DEFAULT NULL,
  `nhis_old_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `drugs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1745 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Encounters`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Encounters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `time_of_encounter` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `patient_id` int NOT NULL,
  `encounter_type` enum('Consultation','Multiple','Prescription','Lab Order','Radiology Order','Service Order','Triage','Observation','Diagnosis','Admission','Discharge','Ward Round','Clinical Note') DEFAULT NULL COMMENT 'Type of encounter',
  `encounter_summary` text COMMENT 'Summary or notes about the encounter',
  `related_entity_type` varchar(255) DEFAULT NULL COMMENT 'Type of related entity (e.g., PrescribedDrug, PrescribedTest, Observation)',
  `related_entity_id` int DEFAULT NULL COMMENT 'ID of the related entity',
  `metadata` json DEFAULT NULL COMMENT 'Additional context data in JSON format',
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `encounters_ibfk_21` (`patient_id`),
  KEY `idx_encounters_encounter_type` (`encounter_type`),
  KEY `idx_encounters_related_entity` (`related_entity_type`,`related_entity_id`),
  CONSTRAINT `encounters_ibfk_19` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `encounters_ibfk_20` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `encounters_ibfk_21` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Histories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `complaint_note` text,
  `history_note` text,
  `examination_note` text,
  `chest` text,
  `cvs` text,
  `other_examination` text,
  `mss` text,
  `abdomen` text,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ent` text,
  `cns` text,
  `respiratory` text,
  `additional_complaint` text,
  PRIMARY KEY (`id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  CONSTRAINT `histories_ibfk_37` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `histories_ibfk_38` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `histories_ibfk_39` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `histories_ibfk_40` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31115 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `HMOs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HMOs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `hmo_num` varchar(255) DEFAULT NULL,
  `insurance_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `insurance_id` (`insurance_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `hmos_ibfk_19` FOREIGN KEY (`insurance_id`) REFERENCES `Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `hmos_ibfk_20` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `icd10_classifications`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icd10_classifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `desc` text NOT NULL,
  `class_code` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `icd10_diseases`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icd10_diseases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `diagnosis` text NOT NULL,
  `code` varchar(255) NOT NULL,
  `class_code` varchar(255) DEFAULT NULL,
  `sub_class_code` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12911 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `icd10_sub_classifications`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icd10_sub_classifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `desc` text NOT NULL,
  `class_code` varchar(255) DEFAULT NULL,
  `sub_class_code` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `icpc2_diseases`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `icpc2_diseases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `diagnosis` text NOT NULL,
  `code` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=726 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Imagings`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Imagings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `imagings_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Immunizations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Immunizations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `immunization_number` varchar(255) DEFAULT NULL,
  `mother_name` varchar(255) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `father_name` varchar(255) DEFAULT NULL,
  `date_registered` datetime DEFAULT NULL,
  `at_birth` json NOT NULL,
  `at_six_weeks` json DEFAULT NULL,
  `at_ten_weeks` json DEFAULT NULL,
  `at_fourteen_weeks` json DEFAULT NULL,
  `at_six_months` json DEFAULT NULL,
  `at_nine_months` json DEFAULT NULL,
  `at_one_year` json DEFAULT NULL,
  `at_fifteen_months` json DEFAULT NULL,
  `at_two_years` json DEFAULT NULL,
  `other_children` json DEFAULT NULL,
  `is_wt_less_than_2_5kg` tinyint(1) DEFAULT '0',
  `is_baby_twin` tinyint(1) DEFAULT '0',
  `is_baby_bottle_fed` tinyint(1) DEFAULT '0',
  `does_family_need_support` tinyint(1) DEFAULT '0',
  `are_siblings_under_weight` tinyint(1) DEFAULT '0',
  `need_extra_care` tinyint(1) DEFAULT '0',
  `reason_for_extra_care` text,
  `staff_id` int DEFAULT NULL,
  `status` enum('ONGOING','COMPLETED','DISCONTINUED') DEFAULT 'ONGOING',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `immunizations_ibfk_19` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `immunizations_ibfk_20` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Inpatient_Inventories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inpatient_Inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `quantity_received` int NOT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `unit_id` int NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `expiration` datetime NOT NULL,
  `quantity_consumed` int DEFAULT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `quantity_left` int DEFAULT NULL,
  `drug_type` enum('Cash','NHIS') NOT NULL,
  `date_received` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Insurances`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Insurances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `insurances_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Inventories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `refill_level` int DEFAULT NULL,
  `accepted_drug_type` enum('Cash Drug','Both','NHIS Drug','All','Private Drug','Retainership Drug','Plaschema Drug') NOT NULL,
  `desc` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `inventories_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Inventory_Item_Histories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory_Item_Histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity_dispensed` int DEFAULT '0',
  `quantity_returned` int DEFAULT '0',
  `quantity_supplied` int DEFAULT '0',
  `quantity_remaining` int NOT NULL,
  `inventory_item_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `item_receiver` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `history_date` datetime NOT NULL,
  `history_type` enum('Dispensed','Returned','Supplied') NOT NULL,
  `patient_id` int DEFAULT NULL,
  `drug_prescription_id` int DEFAULT NULL,
  `additional_item_id` int DEFAULT NULL,
  `visit_id` int DEFAULT NULL,
  `reason_for_return` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_item_id` (`inventory_item_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `unit_id` (`unit_id`),
  KEY `staff_id` (`staff_id`),
  KEY `patient_id` (`patient_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `inventory_item_histories_ibfk_55` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_item_histories_ibfk_56` FOREIGN KEY (`inventory_id`) REFERENCES `Inventories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_item_histories_ibfk_57` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_item_histories_ibfk_58` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_item_histories_ibfk_59` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_item_histories_ibfk_60` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventory_items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventory_id` int NOT NULL,
  `drug_id` int NOT NULL,
  `quantity_received` int NOT NULL,
  `unit_id` int NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `acquired_price` decimal(12,2) NOT NULL,
  `expiration` datetime NOT NULL,
  `quantity_consumed` int DEFAULT '0',
  `dosage_form_id` int DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `quantity_remaining` int DEFAULT '0',
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `drug_type` enum('Cash','NHIS','Plaschema','Private','Retainership') NOT NULL,
  `date_received` datetime NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  PRIMARY KEY (`id`),
  KEY `dosage_form_id` (`dosage_form_id`),
  KEY `drug_id` (`drug_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `measurement_id` (`measurement_id`),
  KEY `staff_id` (`staff_id`),
  KEY `unit_id` (`unit_id`),
  CONSTRAINT `inventory_items_ibfk_55` FOREIGN KEY (`inventory_id`) REFERENCES `Inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `inventory_items_ibfk_56` FOREIGN KEY (`drug_id`) REFERENCES `Drugs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_items_ibfk_57` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_items_ibfk_58` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_items_ibfk_59` FOREIGN KEY (`measurement_id`) REFERENCES `Measurements` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `inventory_items_ibfk_60` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2150 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Investigation_Prescriptions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Investigation_Prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` enum('Antenatal','Consultation') DEFAULT 'Consultation',
  `requester` int DEFAULT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `is_billed` tinyint(1) DEFAULT '0',
  `has_paid` tinyint(1) DEFAULT '0',
  `status` enum('Pending','Completed','Result Added','Partial Result','Partial Approved') NOT NULL DEFAULT 'Pending',
  `result_notes` text,
  `ante_natal_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `patient_id` (`patient_id`),
  KEY `requester` (`requester`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `investigation_prescriptions_ibfk_37` FOREIGN KEY (`requester`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `investigation_prescriptions_ibfk_38` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `investigation_prescriptions_ibfk_39` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `investigation_prescriptions_ibfk_40` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3082 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Investigation_Results`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Investigation_Results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescribed_investigation_id` int NOT NULL,
  `result` text,
  `investigation_prescription_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `date_created` datetime NOT NULL,
  `comments` text,
  `image` text,
  `status` enum('Rejected','Accepted','Pending') DEFAULT 'Pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescribed_investigation_id` (`prescribed_investigation_id`),
  KEY `investigation_prescription_id` (`investigation_prescription_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `investigation_results_ibfk_37` FOREIGN KEY (`prescribed_investigation_id`) REFERENCES `Prescribed_Investigations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `investigation_results_ibfk_38` FOREIGN KEY (`investigation_prescription_id`) REFERENCES `Investigation_Prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `investigation_results_ibfk_39` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `investigation_results_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Investigation_Tariffs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Investigation_Tariffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hmo_id` int DEFAULT NULL,
  `investigation_id` int NOT NULL,
  `insurance_id` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `investigation_tariffs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Investigations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Investigations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `nhis_price` decimal(12,2) DEFAULT NULL,
  `phis_price` decimal(12,2) DEFAULT NULL,
  `is_available_for_nhis` tinyint(1) DEFAULT NULL,
  `is_available_for_phis` tinyint(1) DEFAULT NULL,
  `type` enum('Primary','Secondary') NOT NULL,
  `imaging_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `retainership_price` decimal(12,2) DEFAULT NULL,
  `old_id` int DEFAULT NULL,
  `nhis_old_id` int DEFAULT NULL,
  `pssh_price` decimal(12,2) DEFAULT NULL,
  `is_available_for_pssh` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `imaging_id` (`imaging_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `investigations_ibfk_3` FOREIGN KEY (`imaging_id`) REFERENCES `Imagings` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `investigations_ibfk_4` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `IOCharts`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `IOCharts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `input_item` varchar(255) DEFAULT NULL,
  `input_quantity` text,
  `output_item` text,
  `output_quantity` text,
  `input_total` text,
  `output_total` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `iocharts_ibfk_37` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `iocharts_ibfk_38` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `iocharts_ibfk_39` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `iocharts_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Journal_Entries`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Journal_Entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_date` datetime NOT NULL,
  `reference` varchar(255) NOT NULL,
  `description` text,
  `visit_id` int DEFAULT NULL,
  `patient_id` int DEFAULT NULL,
  `status` varchar(255) DEFAULT 'DRAFT',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Journal_Entry_Lines`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Journal_Entry_Lines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `journal_entry_id` int NOT NULL,
  `account_id` int NOT NULL,
  `debit` decimal(10,2) DEFAULT '0.00',
  `credit` decimal(10,2) DEFAULT '0.00',
  `description` text,
  `cost_center_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Lab_Items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Lab_Items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `voucher` varchar(255) DEFAULT NULL,
  `batch` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `remain_quantity` int DEFAULT '0',
  `unit_id` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `expiration` datetime DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `date_received` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `unit_id` (`unit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `lab_items_ibfk_19` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `lab_items_ibfk_20` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Laboratories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Laboratories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `laboratories_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Measurements`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Measurements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage_form_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dosage_form_id` (`dosage_form_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `measurements_ibfk_19` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `measurements_ibfk_20` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Nhis_Inpatient_Inventories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nhis_Inpatient_Inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `quantity_received` int NOT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `unit_id` int NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `expiration` datetime NOT NULL,
  `quantity_consumed` int DEFAULT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `quantity_left` int DEFAULT NULL,
  `drug_type` enum('Cash','NHIS') NOT NULL,
  `date_received` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Nhis_Outpatient_Inventories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nhis_Outpatient_Inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `quantity_received` int NOT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `unit_id` int NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `expiration` datetime NOT NULL,
  `quantity_consumed` int DEFAULT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `quantity_left` int DEFAULT NULL,
  `drug_type` enum('Cash','NHIS') NOT NULL,
  `date_received` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Nhis_Tests`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nhis_Tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `code` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `sample_id` int NOT NULL,
  `type` enum('primary','secondary') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Nursing_Notes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Nursing_Notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `type_of_duty` varchar(255) NOT NULL,
  `notes` text NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `nursing_notes_ibfk_37` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `nursing_notes_ibfk_38` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `nursing_notes_ibfk_39` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `nursing_notes_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1374 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Observations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Observations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `admission_id` int NOT NULL,
  `weight` float DEFAULT NULL,
  `height` float DEFAULT NULL,
  `bmi` float DEFAULT NULL,
  `rvs` varchar(255) DEFAULT NULL,
  `pulse` float DEFAULT NULL,
  `respiration` varchar(255) DEFAULT NULL,
  `temperature` float NOT NULL,
  `systolic` varchar(255) DEFAULT NULL,
  `diastolic` varchar(255) DEFAULT NULL,
  `heart_rate` varchar(255) DEFAULT NULL,
  `spo2` varchar(255) DEFAULT NULL,
  `muac` varchar(255) DEFAULT NULL,
  `comment` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `observation` text,
  PRIMARY KEY (`id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `observations_ibfk_37` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `observations_ibfk_38` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `observations_ibfk_39` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `observations_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1920 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Operation_Notes`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Operation_Notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `anaesthetist_id` int DEFAULT NULL,
  `scrub_nurse_id` int DEFAULT NULL,
  `surgeon_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `time_in` datetime NOT NULL,
  `time_out` datetime NOT NULL,
  `assistance` json DEFAULT NULL,
  `surgery` text,
  `post_operation_order` text,
  `anaesthesia` text,
  `findings` text,
  `procedure` text,
  `indications` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `anaesthetist_id` (`anaesthetist_id`),
  KEY `patient_id` (`patient_id`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `operation_notes_ibfk_28` FOREIGN KEY (`anaesthetist_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `operation_notes_ibfk_29` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `operation_notes_ibfk_30` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Outpatient_Inventories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Outpatient_Inventories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `quantity_received` int NOT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `unit_id` int NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `expiration` datetime NOT NULL,
  `quantity_consumed` int DEFAULT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `quantity_left` int DEFAULT NULL,
  `drug_type` enum('Cash','NHIS') NOT NULL,
  `date_received` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Patient_Insurances`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patient_Insurances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `insurance_id` int NOT NULL,
  `hmo_id` int NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `plan` varchar(255) DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `enrollee_code` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `insurance_id` (`insurance_id`),
  KEY `hmo_id` (`hmo_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `patient_insurances_ibfk_37` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patient_insurances_ibfk_38` FOREIGN KEY (`insurance_id`) REFERENCES `Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_insurances_ibfk_39` FOREIGN KEY (`hmo_id`) REFERENCES `HMOs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_insurances_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22070 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Patient_Treatments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patient_Treatments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `dosage_administered` text NOT NULL,
  `remarks` text,
  `staff_id` int NOT NULL,
  `date_entered` datetime NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `admission_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `drug_id` (`drug_id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  CONSTRAINT `patient_treatments_ibfk_46` FOREIGN KEY (`drug_id`) REFERENCES `Prescribed_Drugs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_treatments_ibfk_47` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_treatments_ibfk_48` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_treatments_ibfk_49` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patient_treatments_ibfk_50` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Patients`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `phone` varchar(255) NOT NULL,
  `alt_phone` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `country` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `lga` varchar(255) NOT NULL,
  `hospital_id` varchar(255) DEFAULT NULL,
  `next_of_kin_name` varchar(255) DEFAULT NULL,
  `next_of_kin_address` varchar(255) DEFAULT NULL,
  `next_of_kin_phone` varchar(255) DEFAULT NULL,
  `next_of_kin_relationship` varchar(255) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `relationship_to_principal` varchar(255) DEFAULT NULL,
  `photo` text,
  `photo_url` text,
  `date_of_birth` datetime NOT NULL,
  `marital_status` varchar(255) DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `has_insurance` tinyint(1) DEFAULT '0',
  `principal_id` int DEFAULT NULL,
  `patient_type` enum('Dependant','Patient') DEFAULT 'Patient',
  `patient_status` enum('Inpatient','Outpatient','Deceased') DEFAULT 'Outpatient',
  `old_patient_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `complete_name` text,
  `admitted_days_in_year` int DEFAULT '0',
  `is_difficult_patient` tinyint(1) DEFAULT '0',
  `status` enum('active','inactive','banned') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `hospital_id` (`hospital_id`),
  UNIQUE KEY `hospital_id_2` (`hospital_id`),
  UNIQUE KEY `hospital_id_3` (`hospital_id`),
  UNIQUE KEY `hospital_id_4` (`hospital_id`),
  UNIQUE KEY `hospital_id_5` (`hospital_id`),
  UNIQUE KEY `hospital_id_6` (`hospital_id`),
  UNIQUE KEY `hospital_id_7` (`hospital_id`),
  UNIQUE KEY `hospital_id_8` (`hospital_id`),
  UNIQUE KEY `hospital_id_9` (`hospital_id`),
  UNIQUE KEY `hospital_id_10` (`hospital_id`),
  UNIQUE KEY `hospital_id_11` (`hospital_id`),
  KEY `staff_id` (`staff_id`),
  KEY `principal_id` (`principal_id`),
  CONSTRAINT `patients_ibfk_19` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `patients_ibfk_20` FOREIGN KEY (`principal_id`) REFERENCES `Patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Payment`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `bank` varchar(255) DEFAULT NULL,
  `transid` varchar(255) DEFAULT NULL,
  `tdate` datetime DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `editedby` int DEFAULT '0',
  `vdate` datetime DEFAULT NULL,
  `narration` varchar(255) DEFAULT NULL,
  `confirm` tinyint(1) DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `jid` int DEFAULT NULL,
  `batch_no` varchar(255) DEFAULT NULL,
  `confirmed_by` varchar(255) DEFAULT NULL,
  `confirmed_id` varchar(255) DEFAULT NULL,
  `confirmed_date` datetime DEFAULT NULL,
  `payment_type` varchar(255) DEFAULT NULL,
  `uid` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `confirm_note` varchar(255) DEFAULT NULL,
  `isconfirm` tinyint(1) DEFAULT NULL,
  `jid2` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Payment_Histories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment_Histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `narration` text,
  `transaction_id` varchar(255) NOT NULL,
  `transaction_date` datetime NOT NULL,
  `amount` int NOT NULL,
  `service_id` int NOT NULL,
  `service_name` enum('SERVICES','TESTS','INVESTIGATIONS','DRUGS','ITEMS') NOT NULL,
  `mode_of_payment` varchar(255) NOT NULL,
  `staff_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `transaction_id_2` (`transaction_id`),
  KEY `staff_id` (`staff_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `payment_histories_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `payment_histories_ibfk_2` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `payment_histories_ibfk_3` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Payments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `bank` varchar(255) DEFAULT NULL,
  `transid` varchar(255) DEFAULT NULL,
  `tdate` datetime DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `editedby` int DEFAULT '0',
  `vdate` datetime DEFAULT NULL,
  `narration` varchar(255) DEFAULT NULL,
  `confirm` tinyint(1) DEFAULT NULL,
  `service_id` int DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `jid` int DEFAULT NULL,
  `batch_no` varchar(255) DEFAULT NULL,
  `confirmed_by` varchar(255) DEFAULT NULL,
  `confirmed_id` varchar(255) DEFAULT NULL,
  `confirmed_date` datetime DEFAULT NULL,
  `payment_type` varchar(255) DEFAULT NULL,
  `uid` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `confirm_note` varchar(255) DEFAULT NULL,
  `isconfirm` tinyint(1) DEFAULT NULL,
  `jid2` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pharmacy_Items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pharmacy_Items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `voucher` varchar(255) DEFAULT NULL,
  `batch` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `remain_quantity` int DEFAULT NULL,
  `unit_id` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `expiration` datetime NOT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `date_received` datetime NOT NULL,
  `measurement_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `route_id` int DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `drug_type` enum('Cash','NHIS') DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pharmacy_Store_Histories`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pharmacy_Store_Histories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pharmacy_store_id` int NOT NULL,
  `quantity_dispensed` int DEFAULT '0',
  `quantity_returned` int DEFAULT '0',
  `quantity_supplied` int DEFAULT '0',
  `quantity_remaining` int NOT NULL,
  `inventory_id` int DEFAULT NULL,
  `unit_id` int NOT NULL,
  `item_receiver` int DEFAULT NULL,
  `dispensed_by` int DEFAULT NULL,
  `history_date` datetime NOT NULL,
  `history_type` enum('Dispensed','Returned','Supplied') NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `vendor_id` int DEFAULT NULL,
  `selling_price` decimal(10,2) DEFAULT '0.00',
  `unit_price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `pharmacy_store_id` (`pharmacy_store_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `unit_id` (`unit_id`),
  KEY `item_receiver` (`item_receiver`),
  KEY `dispensed_by` (`dispensed_by`),
  KEY `pharmacy_store_histories_ibfk_51` (`vendor_id`),
  CONSTRAINT `pharmacy_store_histories_ibfk_46` FOREIGN KEY (`pharmacy_store_id`) REFERENCES `Pharmacy_Store_Items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_histories_ibfk_47` FOREIGN KEY (`inventory_id`) REFERENCES `Inventories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_histories_ibfk_48` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_histories_ibfk_49` FOREIGN KEY (`item_receiver`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_histories_ibfk_50` FOREIGN KEY (`dispensed_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_histories_ibfk_51` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pharmacy_Store_Item_Logs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pharmacy_Store_Item_Logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pharmacy_store_id` int NOT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `voucher` varchar(255) DEFAULT NULL,
  `batch` varchar(255) DEFAULT NULL,
  `quantity_received` int NOT NULL,
  `quantity_remaining` int DEFAULT '0',
  `unit_id` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `expiration` datetime DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `date_received` datetime DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `drug_type` enum('Cash','NHIS','Private','Retainership') NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `route_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `log_type` enum('Update','Reorder') NOT NULL DEFAULT 'Reorder',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `vendor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pharmacy_store_id` (`pharmacy_store_id`),
  KEY `unit_id` (`unit_id`),
  KEY `staff_id` (`staff_id`),
  KEY `route_id` (`route_id`),
  KEY `measurement_id` (`measurement_id`),
  KEY `dosage_form_id` (`dosage_form_id`),
  KEY `pharmacy_store_item_logs_ibfk_61` (`vendor_id`),
  CONSTRAINT `pharmacy_store_item_logs_ibfk_55` FOREIGN KEY (`pharmacy_store_id`) REFERENCES `Pharmacy_Store_Items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_item_logs_ibfk_56` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_item_logs_ibfk_57` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_item_logs_ibfk_58` FOREIGN KEY (`route_id`) REFERENCES `Route_of_Administrations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_item_logs_ibfk_59` FOREIGN KEY (`measurement_id`) REFERENCES `Measurements` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_item_logs_ibfk_60` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_item_logs_ibfk_61` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1728 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pharmacy_Store_Items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Pharmacy_Store_Items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `shelf` varchar(255) DEFAULT NULL,
  `voucher` varchar(255) DEFAULT NULL,
  `batch` varchar(255) DEFAULT NULL,
  `quantity_received` int NOT NULL,
  `quantity_remaining` int DEFAULT '0',
  `unit_id` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `selling_price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `expiration` datetime DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `date_received` datetime DEFAULT NULL,
  `drug_form` enum('Drug','Consumable') NOT NULL,
  `drug_type` enum('Cash','NHIS','Private','Retainership','Plaschema') NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `route_id` int DEFAULT NULL,
  `strength_input` varchar(255) DEFAULT NULL,
  `measurement_id` int DEFAULT NULL,
  `dosage_form_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `old_id` int DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `vendor_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dosage_form_id` (`dosage_form_id`),
  KEY `drug_id` (`drug_id`),
  KEY `measurement_id` (`measurement_id`),
  KEY `route_id` (`route_id`),
  KEY `staff_id` (`staff_id`),
  KEY `unit_id` (`unit_id`),
  KEY `pharmacy_store_items_ibfk_61` (`vendor_id`),
  CONSTRAINT `pharmacy_store_items_ibfk_55` FOREIGN KEY (`drug_id`) REFERENCES `Drugs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_items_ibfk_56` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_items_ibfk_57` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_items_ibfk_58` FOREIGN KEY (`route_id`) REFERENCES `Route_of_Administrations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_items_ibfk_59` FOREIGN KEY (`measurement_id`) REFERENCES `Measurements` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_items_ibfk_60` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `pharmacy_store_items_ibfk_61` FOREIGN KEY (`vendor_id`) REFERENCES `Vendors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1665 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PostNatals`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PostNatals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int DEFAULT NULL,
  `weight` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `temperature` varchar(255) DEFAULT NULL,
  `pulse` varchar(255) DEFAULT NULL,
  `respiration` varchar(255) DEFAULT NULL,
  `general_condition` varchar(255) DEFAULT NULL,
  `blood_pressure` varchar(255) DEFAULT NULL,
  `involution_of_uterus` varchar(255) DEFAULT NULL,
  `lochia` varchar(255) DEFAULT NULL,
  `episotomy` varchar(255) DEFAULT NULL,
  `pap_smear_date` datetime DEFAULT NULL,
  `result` text,
  `pcv` varchar(255) DEFAULT NULL,
  `comments` text,
  `baby_condition` varchar(255) DEFAULT NULL,
  `reflexes` varchar(255) DEFAULT NULL,
  `feeding` varchar(255) DEFAULT NULL,
  `umbilical_cord` varchar(255) DEFAULT NULL,
  `pelvic_examination` text,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `postnatals_ibfk_46` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `postnatals_ibfk_47` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `postnatals_ibfk_48` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `postnatals_ibfk_49` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `postnatals_ibfk_50` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prescribed_Drugs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prescribed_Drugs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `drug_id` int NOT NULL,
  `dosage_form_id` int NOT NULL,
  `drug_type` enum('Cash','NHIS','Private','Plaschema') NOT NULL,
  `quantity_prescribed` int NOT NULL,
  `quantity_to_dispense` int NOT NULL,
  `quantity_dispensed` int DEFAULT '0',
  `quantity_returned` int DEFAULT '0',
  `route_id` int NOT NULL,
  `frequency` varchar(255) NOT NULL,
  `strength_id` int NOT NULL,
  `duration` int NOT NULL,
  `notes` text,
  `total_price` decimal(12,2) NOT NULL,
  `dispense_status` enum('Dispensed','Pending','Returned','Partial Dispense','Partial Returned') NOT NULL DEFAULT 'Pending',
  `payment_status` enum('Cleared','Paid','Pending','Permitted') NOT NULL DEFAULT 'Pending',
  `billing_status` enum('Billed','Unbilled') NOT NULL DEFAULT 'Unbilled',
  `examiner` int NOT NULL,
  `date_prescribed` datetime NOT NULL,
  `prescribed_strength` varchar(255) NOT NULL,
  `duration_unit` varchar(255) NOT NULL,
  `nhis_status` enum('Approved','Declined','Pending') DEFAULT NULL,
  `drug_group` enum('Primary','Secondary') DEFAULT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `start_date` datetime NOT NULL,
  `dispensed_by` int DEFAULT NULL,
  `returned_by` int DEFAULT NULL,
  `drug_prescription_id` int NOT NULL,
  `inventory_id` int NOT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `surgery_id` int DEFAULT NULL,
  `source` enum('Antenatal','Consultation','Theater','Immunization') DEFAULT 'Consultation',
  `immunization_id` int DEFAULT NULL,
  `auth_code` varchar(255) DEFAULT NULL,
  `dosage_completed` tinyint(1) DEFAULT '0',
  `patient_insurance_id` int DEFAULT NULL,
  `reason_for_return` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `old_id` int DEFAULT NULL,
  `drug_changed_by` int DEFAULT NULL,
  `nhis_drug_processed_by` int DEFAULT NULL,
  `date_nhis_drug_processed` datetime DEFAULT NULL,
  `date_dispensed` datetime DEFAULT NULL,
  `date_returned` datetime DEFAULT NULL,
  `original_total_price` decimal(12,2) DEFAULT NULL,
  `collected_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `drug_id` (`drug_id`),
  KEY `dosage_form_id` (`dosage_form_id`),
  KEY `route_id` (`route_id`),
  KEY `strength_id` (`strength_id`),
  KEY `examiner` (`examiner`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `dispensed_by` (`dispensed_by`),
  KEY `drug_prescription_id` (`drug_prescription_id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `surgery_id` (`surgery_id`),
  KEY `immunization_id` (`immunization_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  KEY `Prescribed_Drugs_ibfk_142` (`nhis_drug_processed_by`),
  KEY `prescribed_Drugs_ibfk_141` (`drug_changed_by`),
  CONSTRAINT `prescribed_drugs_ibfk_127` FOREIGN KEY (`drug_id`) REFERENCES `Drugs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_128` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_129` FOREIGN KEY (`route_id`) REFERENCES `Route_of_Administrations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_130` FOREIGN KEY (`strength_id`) REFERENCES `Measurements` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_131` FOREIGN KEY (`examiner`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_132` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_133` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_134` FOREIGN KEY (`dispensed_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_135` FOREIGN KEY (`drug_prescription_id`) REFERENCES `Drug_Prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_136` FOREIGN KEY (`inventory_id`) REFERENCES `Inventories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_137` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_138` FOREIGN KEY (`surgery_id`) REFERENCES `Surgery_Requests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_139` FOREIGN KEY (`immunization_id`) REFERENCES `Immunizations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_drugs_ibfk_140` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_Drugs_ibfk_141` FOREIGN KEY (`drug_changed_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Prescribed_Drugs_ibfk_142` FOREIGN KEY (`nhis_drug_processed_by`) REFERENCES `Staffs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80431 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prescribed_Investigations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prescribed_Investigations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `investigation_id` int DEFAULT NULL,
  `imaging_id` int NOT NULL,
  `is_urgent` tinyint(1) DEFAULT '0',
  `investigation_type` enum('Cash','NHIS','Other','Private') NOT NULL,
  `requester` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `investigation_prescription_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `payment_status` enum('Cleared','Paid','Pending','Permitted') NOT NULL DEFAULT 'Pending',
  `billing_status` enum('Billed','Unbilled') NOT NULL DEFAULT 'Unbilled',
  `result_id` int DEFAULT NULL,
  `status` enum('Pending','Result Added','Verified','Approved','Referred') NOT NULL DEFAULT 'Pending',
  `investigation_verified_date` datetime DEFAULT NULL,
  `investigation_approved_date` datetime DEFAULT NULL,
  `investigation_verified_by` int DEFAULT NULL,
  `investigation_approved_by` int DEFAULT NULL,
  `nhis_status` enum('Approved','Declined','Pending') DEFAULT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `surgery_id` int DEFAULT NULL,
  `source` enum('Antenatal','Consultation') DEFAULT 'Consultation',
  `auth_code` varchar(255) DEFAULT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `old_id` int DEFAULT NULL,
  `investigation_changed_by` int DEFAULT NULL,
  `investigation_group` enum('Primary','Secondary') DEFAULT NULL,
  `nhis_investigation_processed_by` int DEFAULT NULL,
  `date_nhis_investigation_processed` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `imaging_id` (`imaging_id`),
  KEY `investigation_approved_by` (`investigation_approved_by`),
  KEY `investigation_id` (`investigation_id`),
  KEY `investigation_prescription_id` (`investigation_prescription_id`),
  KEY `investigation_verified_by` (`investigation_verified_by`),
  KEY `patient_id` (`patient_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  KEY `requester` (`requester`),
  KEY `result_id` (`result_id`),
  KEY `surgery_id` (`surgery_id`),
  KEY `visit_id` (`visit_id`),
  KEY `prescribed_investigations_ibfk_121` (`investigation_changed_by`),
  KEY `Prescribed_Investigations_ibfk_122` (`nhis_investigation_processed_by`),
  CONSTRAINT `prescribed_investigations_ibfk_109` FOREIGN KEY (`investigation_id`) REFERENCES `Investigations` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_110` FOREIGN KEY (`imaging_id`) REFERENCES `Imagings` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_111` FOREIGN KEY (`requester`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_112` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_113` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_114` FOREIGN KEY (`investigation_prescription_id`) REFERENCES `Investigation_Prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_115` FOREIGN KEY (`result_id`) REFERENCES `Investigation_Results` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_116` FOREIGN KEY (`investigation_verified_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_117` FOREIGN KEY (`investigation_approved_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_118` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_119` FOREIGN KEY (`surgery_id`) REFERENCES `Surgery_Requests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_120` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_investigations_ibfk_121` FOREIGN KEY (`investigation_changed_by`) REFERENCES `Staffs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Prescribed_Investigations_ibfk_122` FOREIGN KEY (`nhis_investigation_processed_by`) REFERENCES `Staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4249 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prescribed_Services`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prescribed_Services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `service_id` int NOT NULL,
  `is_urgent` tinyint(1) DEFAULT '0',
  `service_type` enum('Cash','NHIS','Other','Private') NOT NULL,
  `requester` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `visit_id` int DEFAULT NULL,
  `patient_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `payment_status` enum('Cleared','Paid','Pending','Permitted') NOT NULL DEFAULT 'Pending',
  `billing_status` enum('Billed','Unbilled') NOT NULL DEFAULT 'Unbilled',
  `quantity` int DEFAULT '1',
  `nhis_status` enum('Approved','Declined','Pending') DEFAULT NULL,
  `source` enum('Antenatal','Consultation','Theater') DEFAULT 'Consultation',
  `ante_natal_id` int DEFAULT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `surgery_id` int DEFAULT NULL,
  `auth_code` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `old_id` int DEFAULT NULL,
  `service_group` enum('Primary','Secondary') DEFAULT NULL,
  `service_changed_by` int DEFAULT NULL,
  `nhis_service_processed_by` int DEFAULT NULL,
  `date_nhis_service_processed` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `requester` (`requester`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  KEY `surgery_id` (`surgery_id`),
  KEY `prescribed_services_ibfk_71` (`service_changed_by`),
  KEY `Prescribed_Services_ibfk_72` (`nhis_service_processed_by`),
  CONSTRAINT `prescribed_services_ibfk_64` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_65` FOREIGN KEY (`requester`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_66` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_67` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_68` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_69` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_70` FOREIGN KEY (`surgery_id`) REFERENCES `Surgery_Requests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_services_ibfk_71` FOREIGN KEY (`service_changed_by`) REFERENCES `Staffs` (`id`),
  CONSTRAINT `Prescribed_Services_ibfk_72` FOREIGN KEY (`nhis_service_processed_by`) REFERENCES `Staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17345 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prescribed_Test_Samples`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prescribed_Test_Samples` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sample_id` int NOT NULL,
  `test_prescription_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `accession_number_suffix` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sample_id` (`sample_id`),
  KEY `test_prescription_id` (`test_prescription_id`),
  KEY `visit_id` (`visit_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `prescribed_test_samples_ibfk_37` FOREIGN KEY (`sample_id`) REFERENCES `Test_Samples` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_test_samples_ibfk_38` FOREIGN KEY (`test_prescription_id`) REFERENCES `Test_Prescriptions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_test_samples_ibfk_39` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_test_samples_ibfk_40` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Prescribed_Tests`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Prescribed_Tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_id` int NOT NULL,
  `sample_id` int NOT NULL,
  `test_prescription_id` int NOT NULL,
  `result_id` int DEFAULT NULL,
  `is_urgent` tinyint(1) DEFAULT '0',
  `test_type` enum('Cash','NHIS','Other','Private') NOT NULL,
  `requester` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `payment_status` enum('Cleared','Paid','Pending','Permitted') NOT NULL DEFAULT 'Pending',
  `billing_status` enum('Billed','Unbilled') NOT NULL DEFAULT 'Unbilled',
  `status` enum('Pending','Completed','Referred','Sample Collected','Result Added','Verified','Approved') NOT NULL DEFAULT 'Pending',
  `result_status` enum('Accepted','Rejected','Pending') DEFAULT 'Pending',
  `test_verified_date` datetime DEFAULT NULL,
  `test_approved_date` datetime DEFAULT NULL,
  `test_verified_by` int DEFAULT NULL,
  `test_approved_by` int DEFAULT NULL,
  `nhis_status` enum('Approved','Declined','Pending') DEFAULT NULL,
  `ante_natal_id` int DEFAULT NULL,
  `surgery_id` int DEFAULT NULL,
  `source` enum('Antenatal','Consultation') DEFAULT 'Consultation',
  `auth_code` varchar(255) DEFAULT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `old_id` int DEFAULT NULL,
  `test_group` enum('Primary','Secondary') DEFAULT NULL,
  `test_changed_by` int DEFAULT NULL,
  `nhis_test_processed_by` int DEFAULT NULL,
  `date_nhis_test_processed` datetime DEFAULT NULL,
  `tester_id` int DEFAULT NULL,
  `test_conducted_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `patient_id` (`patient_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  KEY `requester` (`requester`),
  KEY `result_id` (`result_id`),
  KEY `sample_id` (`sample_id`),
  KEY `surgery_id` (`surgery_id`),
  KEY `test_approved_by` (`test_approved_by`),
  KEY `test_id` (`test_id`),
  KEY `test_prescription_id` (`test_prescription_id`),
  KEY `test_verified_by` (`test_verified_by`),
  KEY `visit_id` (`visit_id`),
  KEY `prescribed_tests_ibfk_121` (`test_changed_by`),
  KEY `Prescribed_Tests_ibfk_122` (`nhis_test_processed_by`),
  KEY `prescribed_tests_ibfk_124` (`tester_id`),
  CONSTRAINT `prescribed_tests_ibfk_109` FOREIGN KEY (`test_id`) REFERENCES `Tests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_110` FOREIGN KEY (`sample_id`) REFERENCES `Test_Samples` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_111` FOREIGN KEY (`test_prescription_id`) REFERENCES `Test_Prescriptions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_112` FOREIGN KEY (`result_id`) REFERENCES `Test_Results` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_113` FOREIGN KEY (`requester`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_114` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_115` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_116` FOREIGN KEY (`test_verified_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_117` FOREIGN KEY (`test_approved_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_118` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_119` FOREIGN KEY (`surgery_id`) REFERENCES `Surgery_Requests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_120` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_121` FOREIGN KEY (`test_changed_by`) REFERENCES `Staffs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Prescribed_Tests_ibfk_122` FOREIGN KEY (`nhis_test_processed_by`) REFERENCES `Staffs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prescribed_tests_ibfk_124` FOREIGN KEY (`tester_id`) REFERENCES `Staffs` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=102141 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Previous_Pregnancies`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Previous_Pregnancies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ante_natal_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `year` varchar(255) NOT NULL,
  `delivery_place` varchar(255) NOT NULL,
  `maturity` varchar(255) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `delivery_type` varchar(255) NOT NULL,
  `weight` int NOT NULL,
  `sex` varchar(255) NOT NULL,
  `fate` varchar(255) NOT NULL,
  `baby_type` varchar(255) NOT NULL,
  `puerperium` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `date_added` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `previous_pregnancies_ibfk_28` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `previous_pregnancies_ibfk_29` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `previous_pregnancies_ibfk_30` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2797 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Requests`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `inventory_id` int NOT NULL,
  `item_id` int NOT NULL,
  `status` enum('Pending','Declined','Granted') NOT NULL DEFAULT 'Pending',
  `requested_by` int DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  `date_processed` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_id` (`inventory_id`),
  KEY `item_id` (`item_id`),
  KEY `requested_by` (`requested_by`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `requests_ibfk_37` FOREIGN KEY (`inventory_id`) REFERENCES `Inventories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `requests_ibfk_38` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `requests_ibfk_39` FOREIGN KEY (`requested_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `requests_ibfk_40` FOREIGN KEY (`processed_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Return_Items`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Return_Items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int DEFAULT '0',
  `inventory_item_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `date_received` datetime NOT NULL,
  `status` enum('Declined','Returned','Pending') NOT NULL DEFAULT 'Pending',
  `reason_for_return` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inventory_item_id` (`inventory_item_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `return_items_ibfk_1` FOREIGN KEY (`inventory_item_id`) REFERENCES `inventory_items` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `return_items_ibfk_2` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Route_of_Administrations`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Route_of_Administrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage_form_id` int NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dosage_form_id` (`dosage_form_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `route_of_administrations_ibfk_19` FOREIGN KEY (`dosage_form_id`) REFERENCES `Dosage_Forms` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `route_of_administrations_ibfk_20` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SequelizeMeta`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Service_Tariffs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Service_Tariffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hmo_id` int DEFAULT NULL,
  `service_id` int NOT NULL,
  `insurance_id` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `service_tariffs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Services`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `code` varchar(255) NOT NULL,
  `type` enum('Primary','Secondary') NOT NULL DEFAULT 'Primary',
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=549 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Staffs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Staffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `date_of_birth` datetime NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `photo` text NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `role` varchar(255) NOT NULL,
  `sub_role` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `address` text NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `date_of_first_appointment` datetime DEFAULT NULL,
  `date_of_commencement` datetime DEFAULT NULL,
  `dolp` datetime DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `present_rank` varchar(255) DEFAULT NULL,
  `chs_cms` varchar(255) DEFAULT NULL,
  `step` int DEFAULT NULL,
  `dd_for_retirement` datetime DEFAULT NULL,
  `nin` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=312 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Surgery_Procedures`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Surgery_Procedures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `surgery_id` int NOT NULL,
  `procedure` text NOT NULL,
  `findings` text NOT NULL,
  `post_operation_order` text,
  `staff_id` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `visit_id` (`visit_id`),
  KEY `surgery_id` (`surgery_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `surgery_procedures_ibfk_37` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_procedures_ibfk_38` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_procedures_ibfk_39` FOREIGN KEY (`surgery_id`) REFERENCES `Surgery_Requests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_procedures_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Surgery_Requests`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Surgery_Requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `service_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `staff_id` int NOT NULL,
  `patient_insurance_id` int DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `visit_id` (`visit_id`),
  KEY `service_id` (`service_id`),
  KEY `staff_id` (`staff_id`),
  KEY `patient_insurance_id` (`patient_insurance_id`),
  CONSTRAINT `surgery_requests_ibfk_46` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_requests_ibfk_47` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_requests_ibfk_48` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_requests_ibfk_49` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `surgery_requests_ibfk_50` FOREIGN KEY (`patient_insurance_id`) REFERENCES `Patient_Insurances` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `System_Settings`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `System_Settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_of_organization` text NOT NULL,
  `address_of_organization` text,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `stamp_image` text,
  `organization_logo` varchar(255) DEFAULT NULL,
  `nhis_daily_quota_amount` decimal(12,2) DEFAULT NULL,
  `system_color` varchar(255) DEFAULT NULL,
  `patient_id_prefix` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Test_Prescriptions`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Test_Prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` enum('Antenatal','Consultation') DEFAULT 'Consultation',
  `requester` int DEFAULT NULL,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `date_requested` datetime NOT NULL,
  `date_sample_received` datetime DEFAULT NULL,
  `is_billed` tinyint(1) DEFAULT '0',
  `has_paid` tinyint(1) DEFAULT '0',
  `accession_number` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Completed','Sample Collected') NOT NULL DEFAULT 'Pending',
  `sample_received_by` int DEFAULT NULL,
  `result_notes` text,
  `ante_natal_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `patient_id` (`patient_id`),
  KEY `requester` (`requester`),
  KEY `sample_received_by` (`sample_received_by`),
  KEY `visit_id` (`visit_id`),
  CONSTRAINT `test_prescriptions_ibfk_46` FOREIGN KEY (`requester`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `test_prescriptions_ibfk_47` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `test_prescriptions_ibfk_48` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `test_prescriptions_ibfk_49` FOREIGN KEY (`sample_received_by`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `test_prescriptions_ibfk_50` FOREIGN KEY (`ante_natal_id`) REFERENCES `Antenatal_Accounts` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10269 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Test_Results`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Test_Results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `prescribed_test_id` int NOT NULL,
  `result` json DEFAULT NULL,
  `test_prescription_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `date_created` datetime NOT NULL,
  `is_abnormal` tinyint(1) DEFAULT '0',
  `status` enum('Rejected','Accepted','Pending') DEFAULT 'Pending',
  `comments` text,
  `institute_referred` text,
  `referral_reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prescribed_test_id` (`prescribed_test_id`),
  KEY `test_prescription_id` (`test_prescription_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `test_results_ibfk_37` FOREIGN KEY (`prescribed_test_id`) REFERENCES `Prescribed_Tests` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `test_results_ibfk_38` FOREIGN KEY (`test_prescription_id`) REFERENCES `Test_Prescriptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `test_results_ibfk_39` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `test_results_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Test_Samples`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Test_Samples` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `test_samples_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Test_Tariffs`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Test_Tariffs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hmo_id` int DEFAULT NULL,
  `test_id` int NOT NULL,
  `insurance_id` int DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `test_tariffs_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tests`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `code` varchar(255) NOT NULL,
  `sample_id` int NOT NULL,
  `type` enum('Primary','Secondary') NOT NULL,
  `result_unit` varchar(255) NOT NULL,
  `valid_range` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `nhis_price` decimal(12,2) DEFAULT NULL,
  `phis_price` decimal(12,2) DEFAULT NULL,
  `is_available_for_nhis` tinyint(1) DEFAULT NULL,
  `is_available_for_phis` tinyint(1) DEFAULT NULL,
  `retainership_price` decimal(12,2) DEFAULT NULL,
  `old_id` int DEFAULT NULL,
  `nhis_old_id` int DEFAULT NULL,
  `result_form` varchar(255) DEFAULT 'DefaultResultForm',
  `pssh_price` decimal(12,2) DEFAULT NULL,
  `is_available_for_pssh` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sample_id` (`sample_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `tests_ibfk_19` FOREIGN KEY (`sample_id`) REFERENCES `Test_Samples` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tests_ibfk_20` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Triages`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Triages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `visit_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `weight` float DEFAULT NULL,
  `height` float DEFAULT NULL,
  `bmi` float DEFAULT NULL,
  `rvs` varchar(255) DEFAULT NULL,
  `pulse` float DEFAULT NULL,
  `respiration` varchar(255) DEFAULT NULL,
  `temperature` varchar(255) NOT NULL,
  `systolic` varchar(255) DEFAULT NULL,
  `diastolic` varchar(255) DEFAULT NULL,
  `heart_rate` varchar(255) DEFAULT NULL,
  `spo2` varchar(255) DEFAULT NULL,
  `muac` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Units`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `units_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `age` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Vendors`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Visits`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Visits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `date_visit_ended` datetime DEFAULT NULL,
  `category` enum('Inpatient','Outpatient','Emergency','Antenatal','Immunization','Maternity','Dialysis','Dental') NOT NULL,
  `staff_id` int DEFAULT NULL,
  `date_visit_start` datetime NOT NULL,
  `department` varchar(255) NOT NULL,
  `professional` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `status` enum('Ended','Ongoing') NOT NULL DEFAULT 'Ongoing',
  `ante_natal_id` int DEFAULT NULL,
  `admission_id` int DEFAULT NULL,
  `has_done_vitals` tinyint(1) DEFAULT '0',
  `is_taken` tinyint(1) DEFAULT '0',
  `immunization_id` int DEFAULT NULL,
  `consultation_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admission_id` (`admission_id`),
  KEY `ante_natal_id` (`ante_natal_id`),
  KEY `immunization_id` (`immunization_id`),
  KEY `patient_id` (`patient_id`),
  KEY `staff_id` (`staff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27689 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WardRounds`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WardRounds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `patient_id` int NOT NULL,
  `admission_id` int NOT NULL,
  `visit_id` int NOT NULL,
  `staff_id` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `admission_id` (`admission_id`),
  KEY `visit_id` (`visit_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `wardrounds_ibfk_37` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `wardrounds_ibfk_38` FOREIGN KEY (`admission_id`) REFERENCES `Admissions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `wardrounds_ibfk_39` FOREIGN KEY (`visit_id`) REFERENCES `Visits` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `wardrounds_ibfk_40` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Wards`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Wards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `staff_id` int DEFAULT NULL,
  `service_id` int NOT NULL,
  `occupant_type` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `staff_id` (`staff_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `wards_ibfk_19` FOREIGN KEY (`staff_id`) REFERENCES `Staffs` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `wards_ibfk_20` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

