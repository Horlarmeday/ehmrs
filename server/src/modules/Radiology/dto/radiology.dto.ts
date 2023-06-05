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
