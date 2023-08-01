import { ServiceType } from '../../../../database/models/prescribedService';

type Services = {
  service_id: number;
  service_type: ServiceType;
  price: string | number;
};
export class PrescribedServiceBody {
  services: Array<Services>;
  staff_id: number;
  visit_id: number;
}
