import { FormSchema, PDFConfig } from '../../../database/models/labFormTemplate';

export class UpdateFormTemplateDto {
  id: number;
  name?: string;
  description?: string;
  category?: string;
  schema_json?: FormSchema;
  pdf_config?: PDFConfig;
  version?: string;
  is_active?: boolean;
  staff_id?: number; // Will be set from authenticated user
}
