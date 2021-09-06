export interface LoginParams {
  username: string;
  password: string;
}

export interface ChangePasswordParam {
  newPassword: string;
  oldPassword: string;
  confirmPassword: string;
  user_id?: number;
}
