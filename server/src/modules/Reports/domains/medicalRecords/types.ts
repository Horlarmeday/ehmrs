import { PatientType } from '../../../Patient/types/patient.types';
import { Gender } from '../../../../database/models/patient';
import { VisitCategory, VisitStatus } from '../../../../database/models/visit';
import { PatientStatus } from '../../../../database/models/patient';
import { DischargeStatus } from '../../../../database/models/admission';

export interface ReportFilters {
  start?: string | Date;
  end?: string | Date;
  patient_type?: PatientType;
  gender?: Gender;
  category?: VisitCategory;
  department?: string;
  status?: VisitStatus | PatientStatus | DischargeStatus | string;
  ward_id?: number;
  cause_of_death?: string;
  age_group?: string;
  currentPage?: number;
  pageLimit?: number;
}
