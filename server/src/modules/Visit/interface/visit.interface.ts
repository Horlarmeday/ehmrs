type VisitType = 'IPD' | 'OPD' | 'Emergency' | 'ANC';

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
