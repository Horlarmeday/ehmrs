// ! GENERATED FILE — tools/type-pipeline (issue #39, ADR-0004). Do not edit by hand.
// ! Requests derive from the server's Joi schemas / module interfaces (server is read-only);
// ! responses are inferred from the scrubbed fixture corpus. Unobserved fields are never invented:
// ! fields missing from some observed scenarios are optional. Regenerate: cd tools/type-pipeline && npm run generate.

export interface LoginRequest {
  password: string;
  username: string;
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
  oldPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  data?: string;
  httpCode?: number;
  message: string;
  status?: "error" | "success";
}
