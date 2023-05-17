export interface UserRole {
  [propName: string]: number | string | string[];
  id: number;
  name: string;
  description: string;
  permissions: string[];
}
