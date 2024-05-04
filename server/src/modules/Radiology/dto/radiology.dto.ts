import { Price } from '../../Laboratory/dto/test-tariff.dto';
import { InvestigationType } from '../../../database/models/investigation';

export class CreateImagingDto {
  name: string;
  description?: string;
  staff_id?: number;
}

export class CreateInvestigationDto {
  name: string;
  description?: string;
  imaging_id: number;
  price: number;
  staff_id?: number;
  type?: InvestigationType;
}

export class InvestigationQueryDto {
  currentPage: number;
  pageLimit?: number;
  search?: string;
  filter?: number;
}

export class InvestigationTariffDto {
  investigation_id: number;
  prices: Price[];
}

export class Result {
  prescribed_investigation_id: number;
  investigation_prescription_id: number;
  name: string;
  patient_id: number;
  result?: string;
  status?: string;
  comments?: string;
}
export class RadiologyResultDto {
  results: Array<Result>;
  staff_id: number;
}
export class RadiologyApprovalDto {
  results: Array<Pick<Result, 'prescribed_investigation_id' | 'investigation_prescription_id'>>;
  staff_id: number;
}
