import { VisitType } from '../../../database/models/visit';

export class Visit {
  id?: number;
  patient_id: number;
  date_visit_ended: Date;
  type: VisitType;
  staff_id: number;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateVisit {
  patient_id: number;
  type: VisitType;
  ante_natal_id?: number;
}
