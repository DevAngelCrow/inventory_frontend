import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
import { CustomerResponse, CustomerForm } from '../interfaces/customer.interfaces';

const getCustomers = async (params?: {
  page?: number;
  per_page?: number;
  filter?: string | null;
  active?: boolean | null;
}): Promise<ApiResponseGeneric<CustomerResponse>> => {
  const response = await httpClient.get<ApiResponseGeneric<CustomerResponse>>(
    'customers',
    params
  );
  return response.data;
};

const postCustomer = async (data: CustomerForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'customers',
    data
  );
  return response;
};

const putCustomer = async (id: string, data: CustomerForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `customers/${id}`,
    data
  );
  return response;
};

const toggleCustomer = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `customers/${id}`
  );
  return response;
};

const getCustomerHistory = async (id: string) => {
  const response = await httpClient.get<ApiResponseGeneric<any>>(
    `customers/${id}/history`
  );
  return response.data;
};

export default {
  getCustomers,
  postCustomer,
  putCustomer,
  toggleCustomer,
  getCustomerHistory,
};
