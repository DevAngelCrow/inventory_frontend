import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';

import {
  ProductCategoryResponse,
  ProductResponse,
  ProductMaintenanceResponse,
  GetCategoriesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateProductPayload,
  UpdateProductPayload,
  CreateMaintenancePayload,
  UpdateMaintenancePayload,
  ResolveMaintenancePayload,
} from '../interfaces/inventory.interfaces';

// --- CATEGORIES ---
const getCategories = async (
  params?: GetCategoriesParams,
): Promise<ApiResponseGeneric<ProductCategoryResponse>> => {
  const queryParams: Record<string, any> = {
    page: params?.page,
    per_page: params?.per_page,
    filter_name: params?.filter_name,
    active: params?.active,
  };

  // Remove undefined values to avoid sending empty params
  Object.keys(queryParams).forEach(
    key => queryParams[key] === undefined && delete queryParams[key],
  );

  const response = await httpClient.get<
    ApiResponseGeneric<ProductCategoryResponse>
  >('inventory/categories', queryParams);
  return response.data;
};

const postCategory = async (data: CreateCategoryPayload) => {
  const response = await httpClient.post<ApiPostResponse>(
    'inventory/categories',
    data,
  );
  return response;
};

const putCategory = async (id: string, data: UpdateCategoryPayload) => {
  const response = await httpClient.put<ApiPostResponse>(
    `inventory/categories/${id}`,
    data,
  );
  return response;
};

const toggleCategory = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `inventory/categories/${id}`,
  );
  return response;
};

// --- PRODUCTS ---
const getProducts = async (params?: {
  page?: number;
  per_page?: number;
  filter_name?: string | null;
  sku?: string | null;
  category_id?: string | null;
  active?: boolean | null;
}): Promise<ApiResponseGeneric<ProductResponse>> => {
  const queryParams: Record<
    string,
    string | number | boolean | null | undefined
  > = {
    page: params?.page,
    per_page: params?.per_page,
    filter_name: params?.filter_name,
    filter_sku: params?.sku,
    filter_category: params?.category_id,
    active: params?.active,
  };

  // Remove undefined values
  Object.keys(queryParams).forEach(
    key => queryParams[key] === undefined && delete queryParams[key],
  );
  const response = await httpClient.get<ApiResponseGeneric<ProductResponse>>(
    'inventory/products',
    queryParams,
  );
  return response.data;
};

const getProductById = async (id: string) => {
  const response = await httpClient.get<{ data: ProductResponse; statusCode: number; message: string }>(
    `inventory/products/${id}`,
  );
  return response.data;
};

const postProduct = async (data: FormData) => {
  const response = await httpClient.post<ApiPostResponse>(
    'inventory/products',
    data,
  );
  return response;
};

const putProduct = async (id: string, data: FormData) => {
  const response = await httpClient.put<ApiPostResponse>(
    `inventory/products/${id}`,
    data,
  );
  return response;
};

const toggleProduct = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `inventory/products/${id}`,
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
  const queryParams: Record<
    string,
    string | number | boolean | null | undefined
  > = {
    ...params,
  };
  Object.keys(queryParams).forEach(
    key => queryParams[key] === undefined && delete queryParams[key],
  );

  const response = await httpClient.get<
    ApiResponseGeneric<ProductMaintenanceResponse>
  >('inventory/maintenance', queryParams);
  return response.data;
};

const postMaintenance = async (data: CreateMaintenancePayload) => {
  const response = await httpClient.post<ApiPostResponse>(
    'inventory/maintenance',
    data,
  );
  return response;
};

const putMaintenance = async (id: string, data: UpdateMaintenancePayload) => {
  const response = await httpClient.put<ApiPostResponse>(
    `inventory/maintenance/${id}`,
    data,
  );
  return response;
};

const resolveMaintenance = async (
  id: string,
  data: ResolveMaintenancePayload,
) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `inventory/maintenance/${id}/resolve`,
    data,
  );
  return response;
};

export default {
  getCategories,
  postCategory,
  putCategory,
  toggleCategory,
  getProducts,
  getProductById,
  postProduct,
  putProduct,
  toggleProduct,
  getMaintenances,
  postMaintenance,
  putMaintenance,
  resolveMaintenance,
};
