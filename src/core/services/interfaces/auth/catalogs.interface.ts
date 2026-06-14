import { GeographicDivisionResponse } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.response.interface';

import { Country } from './country.interface';
import { DocumentType } from './documentType.interface';
import { Gender } from './gender.interface';
import { MaritalStatus } from './maritalStatus.interface';

export interface CatalogsData {
  countries: Country[];
  geographic_divisions: GeographicDivisionResponse[];
  genders: Gender[];
  documentTypes: DocumentType[];
  maritalStatuses: MaritalStatus[];
}

export interface ApiResponseCatalogs {
  statusCode: number;
  data: CatalogsData;
  message: string;
  timestamp: string;
}
