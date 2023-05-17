export interface User {
  [propName: string]: number | string | boolean | string[];
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  locked: boolean;
  activated: boolean;
  addresses: string[];
  phoneNumbers: string[];
}
