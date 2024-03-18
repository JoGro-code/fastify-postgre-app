export interface CreateUserRequest {
  Body: {
    name: string;
    email: string;
  };
}

export interface UpdateUserRequest {
  Params: {
    id: string;
  };
  Body: {
    name?: string;
    email?: string;
  };
}

export interface GetUserRequest {
  Params: {
    id: string;
  };
}

export interface DeleteUserRequest {
  Params: {
    id: string;
  };
}

export interface WorkingHour {
  DayOfTheWeek: number;
  IsWorking: boolean;
  MorningFrom: string;
  MorningUntil: string;
  AfterNoonFrom: string;
  AfterNoonUntil: string;
}

export interface DynamicColumnsData {
  CustomFieldsExternalID: string;
  FieldValue: string;
}

export interface CustomerType {
  ID: bigint;
  Name: string;
  Address1: string;
  Address2: string;
  Street: string;
  City: string;
  ZIPCode: string;
  CustomerNo: string;
  CountryName: string;
  Telephone: string;
  Email: string;
  IsNotUpdateLastAndNextAppointments: boolean;
  CreatedBy: number;
  Created: string;
  Modified: string;
  IsActive: boolean;
  ModifiedBy: number;
  Duration: number;
  Rating: number;
  Custom5: string;
  AllocatedUserExternalID: string;
  Company: string;
  X: number;
  Y: number;
  Lastappointment: string;
  Nextappointment: string;
  State: string;
  Qualification: string;
  Classification: string;
  Priority: number;
  Turnover: number;
  Telefax: string;
  Color: string;
  Size: number;
  Rhythm: string;
  Custom1: string;
  Custom2: string;
  Custom3: string;
  Custom4: string;
  Custom6: string;
  Custom7: string;
  Custom8: string;
  Custom9: string;
  Custom10: string;
  PrefixTitleName: string;
  WorkingHour: WorkingHour[];
  DynamicColumnsData: DynamicColumnsData[];
  CustomerType: number;
}
