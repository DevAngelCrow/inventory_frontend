import { Department } from './municipality.department.interface';

export interface MunicipalityResponse {
  id: string;
  name: string;
  description: string;
  active: string;
  department: Department;
}
