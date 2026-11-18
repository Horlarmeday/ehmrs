// ! GENERATED FILE — tools/type-pipeline (issue #39, ADR-0004). Do not edit by hand.
// ! Requests derive from the server's Joi schemas / module interfaces (server is read-only);
// ! responses are inferred from the scrubbed fixture corpus. Unobserved fields are never invented:
// ! fields missing from some observed scenarios are optional. Regenerate: cd tools/type-pipeline && npm run generate.

export interface SystemSettingsResponse {
  data:
    | {
        address_of_organization: string;
        createdAt: string;
        email: string;
        id: number;
        name_of_organization: string;
        nhis_daily_quota_amount: string;
        organization_logo: null;
        patient_id_prefix: string;
        phone: string;
        stamp_image: null;
        system_color: string;
        updatedAt: string;
      }
    | {
        address_of_organization: string;
        createdAt: string;
        email: string;
        id: number;
        name_of_organization: string;
        nhis_daily_quota_amount: string;
        organization_logo: string;
        patient_id_prefix: string;
        phone: string;
        stamp_image: string;
        system_color: string;
        updatedAt: string;
      };
  message: string;
  status: 'success';
}

export interface UpdateSystemSettingsResponse {
  data?: {
    address_of_organization: string;
    createdAt: string;
    email: string;
    id: number;
    name_of_organization: string;
    nhis_daily_quota_amount: string;
    organization_logo: null;
    patient_id_prefix: string;
    phone: string;
    stamp_image: null;
    system_color: string;
    updatedAt: string;
  };
  httpCode?: number;
  message: string;
  status: 'error' | 'success';
}

export interface ChangePasswordResponse {
  data?: {
    address: string;
    createdAt: string;
    date_of_birth: string;
    department: string;
    email: string;
    firstname: string;
    fullname: string;
    gender: string;
    id: number;
    lastname: string;
    middlename: null;
    password: string;
    phone: string;
    photo: string;
    role: string;
    status: 'Active';
    sub_role: null;
    updatedAt: string;
    username: string;
  };
  httpCode?: number;
  message: string;
  status: 'error' | 'success';
}
