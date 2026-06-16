import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
import {
  ProductCategoryResponse,
  ProductCategoryForm,
  ProductResponse,
  ProductForm,
  ProductMaintenanceResponse,
  ProductMaintenanceForm,
} from '../interfaces/inventory.interfaces';

// --- CATEGORIES ---
const getCategories = async (params?: {
  page?: number;
  per_page?: number;
  filter_name?: string | null;
  status?: boolean | null;
}): Promise<ApiResponseGeneric<ProductCategoryResponse>> => {
  const queryParams: any = {
    page: params?.page,
    per_page: params?.per_page,
    filter_name: params?.filter_name,
    active: params?.status,
  };
  const response = await httpClient.get<ApiResponseGeneric<ProductCategoryResponse>>(
    'inventory/categories',
    queryParams
  );
  return response.data;
};

const postCategory = async (data: ProductCategoryForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'inventory/categories',
    data
  );
  return response;
};

const putCategory = async (id: string, data: ProductCategoryForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `inventory/categories/${id}`,
    data
  );
  return response;
};

const toggleCategory = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `inventory/categories/${id}`
  );
  return response;
};

// --- PRODUCTS ---
const getProducts = async (params?: {
  page?: number;
  per_page?: number;
  filter_name?: string | null;
  sku?: string | null;
  id_category?: string | null;
  active?: boolean | null;
}): Promise<ApiResponseGeneric<ProductResponse>> => {
  const queryParams: any = {
    page: params?.page,
    per_page: params?.per_page,
    filter_name: params?.filter_name,
    filter_sku: params?.sku,
    filter_category: params?.id_category,
    active: params?.active,
  };
  const response = await httpClient.get<ApiResponseGeneric<ProductResponse>>(
    'inventory/products',
    queryParams
  );
  return response.data;
};

const postProduct = async (data: ProductForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'inventory/products',
    data
  );
  return response;
};

const putProduct = async (id: string, data: ProductForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `inventory/products/${id}`,
    data
  );
  return response;
};

const toggleProduct = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `inventory/products/${id}`
  );
  return response;
};

// --- MAINTENANCE ---
const getMaintenances = async (params?: {
  page?: number;
  per_page?: number;
  id_product?: string | null;
  resolved?: boolean | null;
}): Promise<ApiResponseGeneric<ProductMaintenanceResponse>> => {
  const response = await httpClient.get<ApiResponseGeneric<ProductMaintenanceResponse>>(
    'inventory/maintenance',
    params
  );
  return response.data;
};

const postMaintenance = async (data: ProductMaintenanceForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'inventory/maintenance',
    data
  );
  return response;
};

const resolveMaintenance = async (id: string, data: { date_end: string, cost?: number }) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `inventory/maintenance/${id}/resolve`,
    data
  );
  return response;
};

export default {
  getCategories,
  postCategory,
  putCategory,
  toggleCategory,
  getProducts,
  postProduct,
  putProduct,
  toggleProduct,
  getMaintenances,
  postMaintenance,
  resolveMaintenance,
};
