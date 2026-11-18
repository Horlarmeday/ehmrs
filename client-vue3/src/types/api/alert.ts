// ! GENERATED FILE — tools/type-pipeline (issue #39, ADR-0004). Do not edit by hand.
// ! Requests derive from the server's Joi schemas / module interfaces (server is read-only);
// ! responses are inferred from the scrubbed fixture corpus. Unobserved fields are never invented:
// ! fields missing from some observed scenarios are optional. Regenerate: cd tools/type-pipeline && npm run generate.

export interface AlertRequest {
  alert: string;
  visit_id: number;
}

export interface AddAlertResponse {
  data?: {
    alert: string;
    createdAt: string;
    id: number;
    patient_id: number;
    staff_id: number;
    status: 'Active';
    updatedAt: string;
  };
  httpCode?: number;
  message: string;
  status: 'error' | 'success';
}

export interface AlertsResponse {
  data:
    | { currentPage: number; docs: unknown[]; pages: number; perPage: number; total: number }
    | {
        currentPage: number;
        docs: {
          alert: string;
          createdAt: string;
          id: number;
          patient_id: number;
          staff: { firstname: string; fullname: string; lastname: string; middlename: null };
          staff_id: number;
          status: 'Active';
          updatedAt: string;
        }[];
        pages: number;
        perPage: number;
        total: number;
      };
  message: string;
  status: 'success';
}

export interface UpdateAlertResponse {
  data: number[];
  message: string;
  status: 'success';
}
