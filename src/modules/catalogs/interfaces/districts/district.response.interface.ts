import { Municipality } from './districts.municipality.interface';

export interface DistrictResponse {
  id: string;
  name: string;
  description: string;
  active: string;
  municipality: Municipality;
}
