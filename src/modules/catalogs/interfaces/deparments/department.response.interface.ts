import { Country } from './deparment.country.interface';

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  active: string;
  country: Country;
}
