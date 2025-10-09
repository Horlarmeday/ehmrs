import { FormSchema, PDFConfig } from '../../../database/models/labFormTemplate';

export class CreateTemplateVersionDto {
  template_id: number;
  version: string;
  schema_json: FormSchema;
  pdf_config?: PDFConfig;
  change_notes?: string;
  staff_id?: number; // Will be set from authenticated user
}
