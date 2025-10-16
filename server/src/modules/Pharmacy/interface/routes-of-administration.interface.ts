export class RoutesOfAdministration {
  id: number;
  name: string;
  staff_id: number;
  dosage_form_ids?: number[]; // Array of dosage form IDs for many-to-many
  dosage_form_id?: number; // Kept for backward compatibility
  createdAt: Date;
  updatedAt: Date;
}
