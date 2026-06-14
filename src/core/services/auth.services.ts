import { LocationQueryValue } from 'vue-router';

import { GeographicDivisionTypeResponse } from '@/modules/catalogs/interfaces/geographic-division-type/geographic-division-type.response.interface';
import { GeographicDivisionResponse } from '@/modules/catalogs/interfaces/geographic-division/geographic-division.response.interface';

import { httpClient } from '../utils/httpClient';
import { ApiResponseGeneric } from './interfaces/apiResponseGeneric.interface';
import { Country } from './interfaces/auth/country.interface';
import { District } from './interfaces/auth/district.interface';
import { DocumentType } from './interfaces/auth/documentType.interface';
import { Gender } from './interfaces/auth/gender.interface';
import { MaritalStatus } from './interfaces/auth/maritalStatus.interface';
import {
  ApiResponseMenu,
  MenuResponseData,
} from './interfaces/auth/apiResponseMenu.interface';
import { Login } from './interfaces/auth/login.interface';
import { ApiResponseLogin } from './interfaces/auth/apiResponseLogin.interface';
import { ApiResponseLogout } from './interfaces/auth/apiResponseLogout.interface';
import { ApiResponseCatalogs } from './interfaces/auth/catalogs.interface';
import { ProfileDetails } from './interfaces/auth/profileDetails.interface';
import { ApiResponseGenericSingle } from './interfaces/apiResponseGenericSingle.interface';
import { ApiPostResponse } from './apiPostResponse.interface';

const getMaritalStatus = async (): Promise<
  ApiResponseGeneric<MaritalStatus>
> => {
  const response = await httpClient.get<ApiResponseGeneric<MaritalStatus>>(
    'catalogs/marital-statuses',
  );

  return response.data;
};

const getGenders = async (): Promise<ApiResponseGeneric<Gender>> => {
  const response = await httpClient.get<ApiResponseGeneric<Gender>>(
    'catalogs/genders?page=1&per_page=10',
  );
  return response.data;
};

const getCountriesNationalities = async (): Promise<
  ApiResponseGeneric<Country>
> => {
  const response =
    await httpClient.get<ApiResponseGeneric<Country>>('catalogs/countries');
  return response.data;
};

const getGeographicalDivisions = async (
  params?: object,
): Promise<ApiResponseGeneric<GeographicDivisionResponse>> => {
  const response = await httpClient.get<
    ApiResponseGeneric<GeographicDivisionResponse>
  >('catalogs/geographic-divisions', params);
  return response.data;
};
const getGeographicalDivisionsTypes = async (
  params: object,
): Promise<ApiResponseGeneric<GeographicDivisionTypeResponse>> => {
  const response = await httpClient.get<
    ApiResponseGeneric<GeographicDivisionTypeResponse>
  >('catalogs/geographic-division-types', params);
  return response.data;
};
const getDistricts = async (): Promise<ApiResponseGeneric<District>> => {
  const response = await httpClient.get<ApiResponseGeneric<District>>(
    'catalogs/districts?page=1&per_page=10',
  );
  return response.data;
};

const getDocumentTypes = async (): Promise<
  ApiResponseGeneric<DocumentType>
> => {
  const response = await httpClient.get<ApiResponseGeneric<DocumentType>>(
    'profile/document-types',
  );
  return response.data;
};

const signUp = async (data: FormData) => {
  const response = await httpClient.post('auth/sign-up', data);
  return response;
};

const login = async (data: Login): Promise<ApiResponseLogin> => {
  const response = await httpClient.post<ApiResponseLogin>('auth/login', data);
  return response.data;
};

const logout = async () => {
  const response = await httpClient.post<ApiResponseLogout>('auth/logout');
  return response.data;
};

const verifyEmail = async (
  url: LocationQueryValue[] | undefined | string,
  id: string,
  token: string,
) => {
  let urlFormatedString = url?.toString();
  let response;
  if (url === null || url === undefined) {
    urlFormatedString = '';
  }
  if (Array.isArray(url)) {
    urlFormatedString = url.find(value => value !== null) || '';
  }
  if (urlFormatedString) {
    response = await httpClient.get(
      urlFormatedString + `?id=${id}&token=${token}`,
    );
  }
  return response;
};

const getMenu = async (): Promise<ApiResponseMenu<MenuResponseData>> => {
  const response =
    await httpClient.get<ApiResponseMenu<MenuResponseData>>('security/menus/');
  return response.data;
};

const getCatalogs = async (): Promise<ApiResponseCatalogs> => {
  const response = await httpClient.get<ApiResponseCatalogs>('auth/catalogs');
  return response.data;
};

const getProfileDetails = async (
  params?: string,
): Promise<ApiResponseGenericSingle<ProfileDetails>> => {
  const response = await httpClient.get<
    ApiResponseGenericSingle<ProfileDetails>
  >(`profile/people/detail/${params}`);
  return response.data;
};

const updateProfile = async (
  id: string,
  data: FormData,
): Promise<ApiResponseGenericSingle<null>> => {
  const response = await httpClient.put<ApiResponseGenericSingle<null>>(
    `auth/update-profile/${id}`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

const generateLinkResetPassword = async (
  email: string,
): Promise<ApiPostResponse> => {
  const response = await httpClient.post<ApiPostResponse>(
    'auth/forgot-password',
    { email },
  );
  return response.data;
};

const resetPassword = async (
  data: object,
  params: object,
): Promise<ApiPostResponse> => {
  const response = await httpClient.put<ApiPostResponse>(
    `auth/reset-password`,
    { ...data, ...params },
  );
  return response.data;
};
export default {
  getMaritalStatus,
  getGenders,
  getCountriesNationalities,
  getDistricts,
  getDocumentTypes,
  signUp,
  verifyEmail,
  getMenu,
  login,
  logout,
  getCatalogs,
  getGeographicalDivisions,
  getGeographicalDivisionsTypes,
  getProfileDetails,
  updateProfile,
  generateLinkResetPassword,
  resetPassword,
};
