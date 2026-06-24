import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import catalogServices from '@/modules/catalogs/Services/catalog.services';
import { CategoryStatus } from '@/types/global-status.type';

import adminServices from '../services/admin.services';
import { debounce } from '@/core/utils/debounceFunction';
import { RoleStatus } from '../interfaces/role/role.status.response.interface';
import { RoleResponse } from '../interfaces/role/role.response.interface';
import { RoleForm } from '../interfaces/role/role.form.interface';
import { CategoryPermissionsResponse } from '../interfaces/role/role.category-permisions.response.interface';

type filterType = { filter_name?: string; id_status?: string };

export function useRole() {
  const {
    errors,
    defineField,
    handleSubmit,
    validateField,
    resetForm,
    resetField,
    setFieldError,
    setFieldValue,
  } = useForm({
    validationSchema: yup.object({
      id: yup.string().typeError('El campo id debe ser de tipo string'),
      name: yup
        .string()
        .required('El nombre del rol es requerido')
        .min(3, 'El nombre de tener al menos 3 caracteres')
        .max(150, 'El nombre debe tener máximo 150 caracteres'),
      description: yup
        .string()
        .required('La descripción del rol es requerida')
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(255, 'La descripción debe tener máximo 255 caracteres'),
      status: yup
        .mixed<RoleStatus>()
        .required('El campo del estado del rol es requerido'),
      permissions_ids: yup.array(),
      code: yup
        .string()
        .required('El código del rol es requerido')
        .min(3, 'El código debe tener al menos 3 caracteres')
        .max(15, 'El código debe tener máximo 10 caracteres'),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'name',
      header: 'Nombre',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'description',
      header: 'Descripción',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'status.name',
      header: 'Estado',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
    {
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
  ]);

  const headerPermissions = ref<TableHeaders[]>([
    {
      field: 'state',
      header: `Seleccion`,
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 15,
    },
    {
      field: 'name',
      header: 'Nombre',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'description',
      header: 'Descripción',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'category.name',
      header: 'Categoría',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
  ]);

  const role = ref<RoleResponse[] | undefined>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const permissionsPagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const permissionsList = ref<
    {
      id: string;
      name: string;
      description: string;
      active: boolean;
    }[]
  >([]);
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [name, nameAttrs] = defineField('name');
  const [description, descriptionAttrs] = defineField('description');
  const [status, statusAttrs] = defineField('status');
  const [permissions_ids, permissionsIdsAttrs] = defineField('permissions_ids');
  const [code, codeAttrs] = defineField('code');
  const [id_status, idStatusAttrs] = defineField('id_status');
  const filter = reactive<filterType>({
    filter_name: undefined,
    id_status: undefined,
  });
  const filter_permission = ref<{
    name: string;
    category?: {
      id: string;
      name: string;
      description: string;
    };
  }>({ name: '' });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9- ]/g;
  const globalStatus = ref<RoleStatus[]>([]);
  const categories = ref<CategoryPermissionsResponse[]>([]);
  const getStatus = async () => {
    try {
      startLoading();
      const filter = {
        page: undefined,
        per_page: undefined,
        code_category: CategoryStatus.CODE,
      };
      const response = await catalogServices.getGlobalStatus(filter);
      if (response.statusCode === 200) {
        if (Array.isArray(response.data)) {
          globalStatus.value = response.data;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getRole = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        name: filter.filter_name,
        id_status: filter.id_status,
      };
      const response = await adminServices.getRole(params);
      if (response.statusCode === 200) {
        role.value = response.data.data;
        pagination.page = response.data.current_page;
        pagination.per_page = response.data.per_page;
        pagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const addRol = async (form: RoleForm) => {
    try {
      startLoading();
      const response = await adminServices.postRole(form);
      if (response.status === 201) {
        getRole();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message}`,
          show: true,
        });
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const editRole = async (form: RoleForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await adminServices.putRole(id!, body);
      if (response.status === 200) {
        getRole();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message}`,
          show: true,
        });
        return response.data;
      }
    } catch (error) {
      console.log(error);
    } finally {
      finishLoading();
    }
  };

  const toggleRole = async (id: string) => {
    try {
      startLoading();
      const response = await adminServices.toggleRole(id);
      if (response.status === 200) {
        getRole();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message}`,
          show: true,
        });
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getRolById = async (id: string) => {
    try {
      startLoading();
      permissionsList.value = [];
      permissionsPagination.total_items = 0;
      const response = await adminServices.getRol(id);
      if (response.statusCode === 200) {
        permissionsList.value = response.data.permissions
          ? response.data.permissions
          : [];
        permissionsPagination.per_page = 10;
        permissionsPagination.total_items = response.data.permissions.length;
      }
      return response;
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getPermissions = async () => {
    try {
      startLoading();
      let filter = {
        page: permissionsPagination.page,
        per_page: permissionsPagination.per_page,
        name: filter_permission.value.name
          ? filter_permission.value.name
          : undefined,
        category_permission_id: filter_permission.value.category?.id,
        active: true,
      };
      const response = await adminServices.getPermissions(filter);
      if (response.statusCode === 200) {
        permissionsList.value = response.data.data;
        permissionsPagination.page = response.data.current_page;
        permissionsPagination.per_page = response.data.per_page;
        permissionsPagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getCategoryPermissions = async () => {
    try {
      startLoading();
      const filters = {
        active: true,
      };
      const response = await adminServices.getCategoryPermissions(filters);
      if (response.statusCode === 200) {
        categories.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const validateAlphaInput = (
    value: string | undefined,
    regex: RegExp = findRegex,
  ) => {
    if (!value) {
      value = '';
    }
    const sanitizedValue = sanitizedValueInput(value, regex);
    nextTick(() => {
      filter.filter_name = sanitizedValue;
    });
  };

  const cleanSearch = () => {
    if (
      (!filter.filter_name || filter.filter_name === '') &&
      filter.id_status === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.id_status = undefined;
    getRole();
  };

  const setRoleItem = (value: RoleResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('status', value?.status);
    setFieldValue(
      'permissions_ids',
      value.permissions?.length
        ? value.permissions.map(permission => permission.id)
        : [],
    );
    setFieldValue('code', value?.code);
    setFieldValue('id_status', value?.status.id);
  };

  const findRole = (value: filterType) => {
    if (value) {
      getRole();
    }
  };
  const findPermission = (value: {
    name: string;
    category?: {
      id: string;
      name: string;
      description: string;
    };
  }) => {
    if (value) {
      getPermissions();
    }
  };

  const debouncedFindRole = debounce(() => {
    pagination.page = 1;
    getRole();
  }, 700);

  const debouncedCleanSearch = debounce(() => {
    cleanSearch();
  }, 700);

  const debouncedFindPermission = debounce(() => {
    permissionsPagination.page = 1;
    getPermissions();
  }, 700);

  return {
    headers,
    errors,
    defineField,
    handleSubmit,
    validateField,
    resetForm,
    resetField,
    setFieldError,
    setFieldValue,
    getStatus,
    validateAlphaInput,
    cleanSearch,
    setRoleItem,
    findRole,
    getRole,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    status,
    statusAttrs,
    id_status,
    idStatusAttrs,
    code,
    codeAttrs,
    alert,
    filter,
    pagination,
    globalStatus,
    role,
    headerPermissions,
    permissionsPagination,
    permissionsList,
    permissions_ids,
    permissionsIdsAttrs,
    filter_permission,
    addRol,
    editRole,
    toggleRole,
    findPermission,
    getPermissions,
    getRolById,
    getCategoryPermissions,
    categories,
    debouncedFindRole,
    debouncedCleanSearch,
    debouncedFindPermission,
  };
}
