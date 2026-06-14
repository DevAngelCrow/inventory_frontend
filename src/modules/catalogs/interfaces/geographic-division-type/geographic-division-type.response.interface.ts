import { CountryResponse } from '../country.response.interface';
import { GeographicDivisionTypeStatus } from './geographic-division-type.status.interface';

export interface GeographicDivisionTypeResponse {
  id: string;
  name: string;
  level: number;
  id_country: string;
  active: boolean;
  country: CountryResponse;
  status: GeographicDivisionTypeStatus;
}
