export type OtherChildren = {
  sex: string;
  year: number;
  state_of_health: string;
};

export type ImmunizationData = {
  medications: string[];
  weight: number;
  createdAt: Date;
  staff: {
    fullname: string;
  };
};

export enum AccountStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  DISCONTINUED = 'DISCONTINUED',
}

export type CreateImmunizationBody = {
  patient_id: number;
  mother_name: string;
  father_name: string;
  at_birth: ImmunizationData;
  other_children?: OtherChildren;
  is_wt_less_than_2_5kg?: boolean;
  is_baby_twin?: boolean;
  place_of_birth: string;
  is_baby_bottle_fed?: boolean;
  does_family_need_support?: boolean;
  are_siblings_under_weight?: boolean;
  need_extra_care?: boolean;
  reason_for_extra_care?: string;
  service_id: number | number[];
  staff_id: number;
};
