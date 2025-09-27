import { VisitCategory } from '../../../database/models/visit';

export class CreateVisit {
  patient_id: number;
  category: VisitCategory;
  ante_natal_id?: number;
  immunization_id?: number;
  type?: string;
  professional: string;
  department?: string;
  date_of_visit?: Date;
  service_id?: number | number[];
  staff_id: number;
  test_id?: number | number[];

  // Emergency-specific fields
  emergency_priority?: string;
  chief_complaint?: string;
  initial_assessment?: string;

  // Dialysis-specific fields
  dialysis_notes?: string;
  dialysis_priority?: string;
  scheduled_time?: string;
  doctor_id?: number;
  dialysis_type?: string;
}
