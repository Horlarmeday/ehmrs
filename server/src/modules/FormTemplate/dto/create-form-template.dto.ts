import { FormSchema, PDFConfig } from '../../../database/models/labFormTemplate';

export class CreateFormTemplateDto {
  name: string;
  code: string;
  description?: string;
  category?: string;
  schema_json: FormSchema;
  pdf_config?: PDFConfig;
  version?: string;
  is_active?: boolean;
  staff_id?: number; // Will be set from authenticated user
}
