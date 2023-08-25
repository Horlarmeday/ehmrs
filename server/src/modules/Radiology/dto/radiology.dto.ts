import { Price } from '../../Laboratory/dto/test-tariff.dto';

export class CreateImagingDto {
  name: string;
  description?: string;
  staff_id?: number;
}

export class CreateInvestigationDto {
  name: string;
  description?: string;
  imaging_id: number;
  staff_id?: number;
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
  investigation_prescription_id: string;
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
