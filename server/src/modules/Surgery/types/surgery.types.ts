export type RequestSurgeryBody = {
  visit_id: number;
  service_id: number;
  staff_id: number;
  notes: number;
};

export type OperationNoteBody = {
  visit_id: number;
  staff_id: number;
  assistance: string;
  anaesthetist_id: number;
  scrub_nurse_id: number;
  surgeon_id: number;
  time_in: Date;
  time_out: Date;
  post_operation_order: string;
  surgery: string;
  anaesthesia: string;
  procedure: string;
  findings: string;
  indications: string;
};
