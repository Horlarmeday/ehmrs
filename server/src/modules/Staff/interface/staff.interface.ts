export class Staff {
  id?: number;
  firstname: string;
  lastname: string;
  middlename?: string;
  gender: string;
  phone: string;
  username: string;
  address: string;
  department: string;
  role: string;
  sub_role: string;
  photo: string;
  status: string;
  date_of_birth: Date;
  email: string;
  fullname?: string;
  password: string;
}

export enum Status {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export class StaffQueryParam {
  currentPage?: number;
  pageLimit?: number;
  search?: string;
}
