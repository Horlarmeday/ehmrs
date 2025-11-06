ALTER TABLE patients ADD COLUMN created_date DATE
    GENERATED ALWAYS AS (DATE(createdAt)) STORED;

CREATE INDEX idx_patients_date_filters
    ON patients (created_date, patient_type, gender);

ALTER TABLE visits
    ADD COLUMN visit_date DATE
        GENERATED ALWAYS AS (DATE(date_visit_start)) STORED;

ALTER TABLE admissions
    ADD COLUMN admitted_date DATE
        GENERATED ALWAYS AS (DATE(date_admitted)) STORED;

ALTER TABLE clinical_bills ADD COLUMN auto_deposit_attempted BOOLEAN DEFAULT FALSE;
ALTER TABLE histories ADD COLUMN general_diagnosis TEXT DEFAULT NULL;