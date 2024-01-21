import { VisitCategory } from '../../../database/models/visit';

export class CreateVisit {
  patient_id: number;
  category: VisitCategory;
  ante_natal_id?: number;
  immunization_id?: number;
  type: string;
  professional: string;
  department: string;
  date_of_visit: Date;
  service_id: number;
  staff_id: number;
}
