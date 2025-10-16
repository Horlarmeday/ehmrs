export class DosageMeasurement {
  id?: number;
  measurement_id?: number;
  name: string;
  staff_id: number;
  dosage_form_ids?: number[]; // Array for many-to-many
  dosage_form_id?: number; // Keep for backward compatibility
  createdAt?: Date;
  updatedAt?: Date;
}
