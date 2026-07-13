import { httpClient } from '@/core/utils/httpClient';
import { ApiResponseGeneric } from '@/core/services/interfaces/apiResponseGeneric.interface';
import { ApiPostResponse } from '@/core/services/apiPostResponse.interface';
import { paginateParams } from '@/core/services/interfaces/params.paginate.interface';

import { RoutesResponse } from '../interfaces/routes/routes.response.interface';
import { RouteForm } from '../interfaces/routes/route-form.interface';
import { PermissionsResponse } from '../interfaces/permissions/permissions.response.interface';
import { PermissionForm } from '../interfaces/permissions/permission.form.interface';
import { PermissionsCategoryResponse } from '../interfaces/permissions/permission.category.response.interface';
import { CategoryPermissionForm } from '../interfaces/category-permissions/category-permission-form.interface';
import { RoleResponse } from '../interfaces/role/role.response.interface';
import { RoleForm } from '../interfaces/role/role.form.interface';
import { RouteResponseById } from '../interfaces/routes/route-by-id.response.interface';
import { UsersResponse } from '../interfaces/user-role/users.response.interface';
import { UserRoleByIdResponse } from '../interfaces/user-role/user-role-by-id.response.interface';
import { UserRoleUpdateForm } from '../interfaces/user-role/user-role-update.form.interface';

export interface ParamsFilter {
  active?: boolean;
  name?: string;
}
const getAllRoutes = async (
  params: paginateParams & ParamsFilter,
): Promise<ApiResponseGeneric<RoutesResponse>> => {
  const response = await httpClient.get<ApiResponseGeneric<RoutesResponse>>(
    'security/routes/',
    params,
  );
  return response.data;
};

const getAllRoutesWithOutPaginate = async (
  params: paginateParams & ParamsFilter,
) => {
  const response = await httpClient.get<ApiResponseGeneric<RoutesResponse>>(
    'security/routes/',
    params,
  );

  return response.data;
};

const addRoute = async (data: RouteForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'security/routes',
    data,
  );
  return response;
};

const editRoute = async (id: string, data: RouteForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `security/routes/${id}`,
    data,
  );
  return response;
};

const toggleRoute = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `security/routes/${id}`,
  );
  return response;
};

const getRoute = async (id: string) => {
  const response = await httpClient.get<ApiPostResponse<RouteResponseById>>(
    `security/routes/${id}`,
  );
  return response.data;
};

const getPermissions = async (
  params: paginateParams | { name: string; id_category_permissions?: string },
): Promise<ApiResponseGeneric<PermissionsResponse>> => {
  const response = await httpClient.get<
    ApiResponseGeneric<PermissionsResponse>
  >('security/permissions/', params);
  return response.data;
};

const postPermission = async (data: PermissionForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'security/permissions/',
    data,
  );
  return response;
};

const putPermission = async (id: string, data: PermissionForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `security/permissions/${id}`,
    data,
  );
  return response;
};

const togglePermission = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `security/permissions/${id}`,
  );
  return response;
};

const getCategoryPermissions = async (
  params?: paginateParams & ParamsFilter,
) => {
  const response = await httpClient.get<
    ApiResponseGeneric<PermissionsCategoryResponse>
  >('security/category-permissions', params);
  return response.data;
};

const postCategoryPermission = async (data: CategoryPermissionForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    `security/category-permissions`,
    data,
  );
  return response;
};
const putCategoryPermission = async (
  id: string,
  data: CategoryPermissionForm,
) => {
  const response = await httpClient.put<ApiPostResponse>(
    `security/category-permissions/${id}`,
    data,
  );
  return response;
};

const toggleCategoryPermission = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `security/category-permissions/${id}`,
  );
  return response;
};

const getRole = async (params: paginateParams) => {
  const response = await httpClient.get<ApiResponseGeneric<RoleResponse>>(
    'security/role/',
    params,
  );
  return response.data;
};

const postRole = async (data: RoleForm) => {
  const response = await httpClient.post<ApiPostResponse>(
    'security/role',
    data,
  );
  return response;
};

const putRole = async (id: string, data: RoleForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `security/role/${id}`,
    data,
  );
  return response;
};

const toggleRole = async (id: string) => {
  const response = await httpClient.patch<ApiPostResponse>(
    `security/role/${id}`,
  );
  return response;
};

const getRol = async (id: string) => {
  const response = await httpClient.get<ApiPostResponse<RoleResponse>>(
    `security/role/${id}`,
  );
  return response.data;
};

const getUsers = async (
  params: paginateParams,
): Promise<ApiResponseGeneric<UsersResponse>> => {
  const response = await httpClient.get<ApiResponseGeneric<UsersResponse>>(
    'identity/users',
    params,
  );
  return response.data;
};

const getUserRoleById = async (
  id: string,
): Promise<ApiPostResponse<UserRoleByIdResponse>> => {
  const response = await httpClient.get<ApiPostResponse<UserRoleByIdResponse>>(
    `security/user-role/${id}`,
  );
  return response.data;
};

const putUserRole = async (id: string, data: UserRoleUpdateForm) => {
  const response = await httpClient.put<ApiPostResponse>(
    `security/user-role/${id}`,
    data,
  );
  return response;
};

export default {
  getAllRoutes,
  getAllRoutesWithOutPaginate,
  addRoute,
  editRoute,
  toggleRoute,
  getPermissions,
  postPermission,
  putPermission,
  togglePermission,
  getCategoryPermissions,
  postCategoryPermission,
  putCategoryPermission,
  toggleCategoryPermission,
  getRole,
  postRole,
  putRole,
  toggleRole,
  getRoute,
  getRol,
  getUsers,
  getUserRoleById,
  putUserRole,
};
