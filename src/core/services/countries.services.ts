import { httpClient } from '../utils/httpClient';
import { ApiResponseGeneric } from './interfaces/apiResponseGeneric.interface';
import { Country } from './interfaces/country/country.interface';

const getCountriesNationalities = async (): Promise<
  ApiResponseGeneric<Country>
> => {
  const response = await httpClient.get<ApiResponseGeneric<Country>>(
    'profile/countries?page=1&per_page=10',
  );
  return response.data;
};

export default {
  getCountriesNationalities,
};
