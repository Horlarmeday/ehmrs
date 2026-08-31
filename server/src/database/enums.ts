// ================================
// CENTRALIZED ENUMS
// ================================
// All enums consolidated from model files for better maintainability
// Naming convention: PrefixWithDomainName to avoid conflicts

// ================================
// GENERAL ENUMS
// ================================

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  BANNED = 'banned',
}

export enum Source {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
  IMMUNIZATION = 'Immunization',
  ADMISSION = 'Admission',
}

export enum BillingStatus {
  BILLED = 'Billed',
  UNBILLED = 'Unbilled',
}

// ================================
// PATIENT & VISIT ENUMS
// ================================

export enum PatientStatus {
  INPATIENT = 'Inpatient',
  OUTPATIENT = 'Outpatient',
  DECEASED = 'Deceased',
}

export enum PatientActiveStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export enum VisitCategory {
  IPD = 'Inpatient',
  OPD = 'Outpatient',
  EMERGENCY = 'Emergency',
  ANC = 'Antenatal',
  IMMUNIZATION = 'Immunization',
  MATERNITY = 'Maternity',
  DIALYSIS = 'Dialysis',
}

export enum VisitStatus {
  ONGOING = 'Ongoing',
  ENDED = 'Ended',
}

// ================================
// DRUG & PHARMACY ENUMS
// ================================

export enum PharmacyDrugType {
  CASH = 'Cash',
  NHIS = 'NHIS',
  PRIVATE = 'Private',
  RETAINERSHIP = 'Retainership',
  // Present in the database's own enum and in a live `Inventories` dispensary, but omitted here
  // until #304 — so a Plaschema store row could not be written through the model at all.
  PLASCHEMA = 'Plaschema',
}

export enum DrugForm {
  DRUG = 'Drug',
  CONSUMABLE = 'Consumable',
}

export enum DrugGroup {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum DrugStatus {
  PENDING = 'Pending',
  COMPLETE_DISPENSE = 'Complete Dispense',
  PARTIAL_DISPENSED = 'Partial Dispense',
}

// Shared enums for prescribed items
export enum DispenseStatus {
  DISPENSED = 'Dispensed',
  PENDING = 'Pending',
  RETURNED = 'Returned',
  PARTIAL_DISPENSED = 'Partial Dispense',
  PARTIAL_RETURNED = 'Partial Returned',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  CLEARED = 'Cleared',
  PERMITTED = 'Permitted',
}

export enum PrescribedAdditionalItemSource {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
  IMMUNIZATION = 'Immunization',
}

// ================================
// TEST & INVESTIGATION ENUMS
// ================================

export enum PrescriptionType {
  CASH = 'Cash',
  NHIS = 'NHIS',
  OTHER = 'Other',
  PRIVATE = 'Private',
}

export enum PrescribedTestStatus {
  PENDING = 'Pending',
  REFERRED = 'Referred',
  COMPLETED = 'Completed',
  RESULT_ADDED = 'Result Added',
  SAMPLE_COLLECTED = 'Sample Collected',
  VERIFIED = 'Verified',
  APPROVED = 'Approved',
}

export enum TestPrescriptionSource {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
}

export enum TestPrescriptionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  SAMPLE_COLLECTED = 'Sample Collected',
}

export enum GeneralTestType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum NHISTestType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum ResultForm {
  DEFAULT_RESULT_FORM = 'DefaultResultForm',
  WIDAL_REACTION_FORM = 'WidalReactionForm',
  ANALYTE_FORM = 'AnalyteForm',
  BILIRUBIN_FORM = 'BilirubinForm',
  OGTT_FORM = 'OGTTForm',
  SERUM_FORM = 'SerumForm',
  LFT_FORM = 'LFTForm',
  LIPID_PROFILE_FORM = 'LipidProfileForm',
  SEUCR_FORM = 'SEUCrForm',
  SPUTUM_FORM = 'SputumForm',
  STOOL_ANALYSIS_FORM = 'StoolAnalysisForm',
  SEMEN_ANALYSIS_FORM = 'SemenAnalysisForm',
  URINALYSIS_FORM = 'UrinalysisForm',
  URINE_SWAB_FORM = 'UrineSwabForm',
  HORMONAL_ASSAY_FORM = 'HormonalAssayForm',
  GLUCOSE_FORM = 'GlucoseForm',
}

export enum ResultStatus {
  PENDING = 'Pending',
  REJECTED = 'Rejected',
  ACCEPTED = 'Accepted',
}

export enum InvestigationPrescriptionSource {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
}

export enum InvestigationPrescriptionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  RESULT_ADDED = 'Result Added',
  PARTIAL_RESULT = 'Partial Result',
  PARTIAL_APPROVED = 'Partial Approved',
}

export enum InvestigationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  APPROVED = 'Approved',
  RESULT_ADDED = 'Result Added',
  REFERRED = 'Referred',
  COMPLETED = 'Completed',
  PARTIAL_RESULT = 'Partial Result',
  PARTIAL_APPROVED = 'Partial Approved',
}

export enum InvestigationType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

// ================================
// SERVICE ENUMS
// ================================

export enum GeneralServiceType {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum PrescribedServiceType {
  CASH = 'Cash',
  NHIS = 'NHIS',
  OTHER = 'Other',
  PRIVATE = 'Private',
}

export enum PrescribedServiceSource {
  ANC = 'Antenatal',
  CONSULTATION = 'Consultation',
  THEATER = 'Theater',
}

export enum ServiceGroup {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
}

export enum ServiceName {
  DRUGS = 'DRUGS',
  TESTS = 'TESTS',
  INVESTIGATIONS = 'INVESTIGATIONS',
  SERVICES = 'SERVICES',
  ITEMS = 'ITEMS',
}

// ================================
// INVENTORY & STORE ENUMS
// ================================

export enum InventoryItemStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export enum HistoryType {
  DISPENSED = 'Dispensed',
  RETURNED = 'Returned',
  SUPPLIED = 'Supplied',
}

export enum LogType {
  UPDATE = 'Update',
  REORDER = 'Reorder',
}

export enum ReturnItemStatus {
  RETURNED = 'Returned',
  PENDING = 'Pending',
  DECLINED = 'Declined',
}

export enum AcceptedDrugType {
  CASH = 'Cash Drug',
  NHIS = 'NHIS Drug',
  PRIVATE = 'Private Drug',
  RETAINERSHIP = 'Retainership Drug',
  BOTH = 'Both',
  ALL = 'All',
}

// ================================
// ADMISSION & DISCHARGE ENUMS
// ================================

export enum DischargeStatus {
  DISCHARGED = 'Discharged',
  ON_ADMISSION = 'On Admission',
}

export enum DischargeType {
  ABSCONDED = 'Absconded',
  DISCHARGE = 'Discharge',
  REFER = 'Refer',
  DEATH = 'Death',
  LAMA = 'Lama',
  TRANSFER = 'Transfer',
}

export enum BedStatus {
  TAKEN = 'Taken',
  UNTAKEN = 'Untaken',
}

// ================================
// ANTENATAL ENUMS
// ================================

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCONTINUED = 'DISCONTINUED',
  INACTIVE = 'INACTIVE',
}

// ================================
// DIAGNOSIS ENUMS
// ================================

export enum Certainty {
  PRESUMED = 'Presumed',
  CONFIRMED = 'Confirmed',
}

export enum DiagnosisType {
  ICPC2 = 'ICPC2',
  ICD10 = 'ICD10',
}

// ================================
// ENCOUNTER ENUMS
// ================================

export enum EncounterType {
  CONSULTATION = 'Consultation',
  PRESCRIPTION = 'Prescription',
  LAB_ORDER = 'Lab Order',
  RADIOLOGY_ORDER = 'Radiology Order',
  SERVICE_ORDER = 'Service Order',
  TRIAGE = 'Triage',
  OBSERVATION = 'Observation',
  DIAGNOSIS = 'Diagnosis',
  ADMISSION = 'Admission',
  DISCHARGE = 'Discharge',
  WARD_ROUND = 'Ward Round',
  CLINICAL_NOTE = 'Clinical Note',
  MULTIPLE = 'Multiple',
}

// ================================
// REQUEST ENUMS
// ================================

export enum RequestStatus {
  PENDING = 'Pending',
  GRANTED = 'Granted',
  DECLINED = 'Declined',
}

// ================================
// ALERT ENUMS
// ================================

export enum AlertStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

// ================================
// DEFAULT ENUMS
// ================================

export enum DefaultType {
  ADMISSION_ITEMS = 'ADMISSION_ITEMS',
  INJECTION_ITEMS = 'INJECTION_ITEMS',
  OPERATION_ITEMS = 'OPERATION_ITEMS',
  ANC_ROUTINE_TESTS = 'ANC_ROUTINE_TESTS',
  ANC_ROUTINE_DRUGS = 'ANC_ROUTINE_DRUGS',
  WATER_INJECTIONS = 'WATER_INJECTIONS',
  CIRCUMCISION_ROUTINE_DRUGS = 'CIRCUMCISION_ROUTINE_DRUGS',
  HSG_ADDITIONAL_ITEMS = 'HSG_ADDITIONAL_ITEMS',
  DIALYSIS_ITEMS = 'DIALYSIS_ITEMS',
}

// ================================
// ANTENATAL ENUMS
// ================================
export enum AntenatalAccountStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCONTINUED = 'DISCONTINUED',
  INACTIVE = 'INACTIVE',
}
