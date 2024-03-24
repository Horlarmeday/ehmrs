import { ServiceType } from '../../../../database/models/prescribedService';

type Services = {
  service_id: number;
  service_type: ServiceType;
  price: number;
  quantity?: number;
};
export class PrescribedBulkServiceBody {
  services: Array<Services>;
  staff_id: number;
  visit_id: number;
  ante_natal_id?: number;
  surgery_id?: number;
}

export class PrescribeServiceBody {
  service_id: number;
  patient_id: number;
  price: number;
  service_type: 'Cash' | 'NHIS';
  requester?: number;
  visit_id?: number;
  ante_natal_id?: number;
  surgery_id?: number;
}
