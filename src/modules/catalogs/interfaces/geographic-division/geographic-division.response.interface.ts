import { CountryResponse } from '../country.response.interface';
import { GeographicDivisionTypeSimple } from './geographic-division.type.interface';
import { GeographicDivisionParent } from './geographic-division.parent.interface';
import { GeographicDivisionTypeStatus } from '../geographic-division-type/geographic-division-type.status.interface';

export interface GeographicDivisionResponse {
  id: string;
  name: string;
  description: string;
  id_country: string;
  id_type: string;
  id_parent?: string;
  active: boolean;
  type: GeographicDivisionTypeSimple;
  country: CountryResponse;
  parent?: GeographicDivisionParent;
  status: GeographicDivisionTypeStatus;
}
