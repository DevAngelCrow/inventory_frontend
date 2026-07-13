import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { debounce } from '@/core/utils/debounceFunction';

import adminServices from '../services/admin.services';
import { PermissionsResponse } from '../interfaces/permissions/permissions.response.interface';
import { PermissionsCategory } from '../interfaces/permissions/permission.category.interface';
import { PermissionsCategoryResponse } from '../interfaces/permissions/permission.category.response.interface';
import { PermissionForm } from '../interfaces/permissions/permission.form.interface';
type filterType = {
  filter_name?: string;
  active?: boolean | 'Todos';
  category_permission_id?: string;
};
export function usePermission() {
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
        .required('El nombre del permiso es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre debe tener máximo 150 caracteres'),
      description: yup
        .string()
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(150, 'La descripción debe tener máximo 150 caracteres')
        .nullable(),
      category: yup
        .mixed<PermissionsCategory>()
        .required('El campo de la categoría del permiso es requerido'),
      active: yup.boolean(),
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
      field: 'category.name',
      header: 'Categoria',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'active',
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

  const permissions = ref<PermissionsResponse[] | undefined>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [name, nameAttrs] = defineField('name');
  const [description, descriptionAttrs] = defineField('description');
  const [category, categoryAttrs] = defineField('category');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    active: undefined,
    category_permission_id: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9- ]/g;
  const categoryPermissions = ref<PermissionsCategoryResponse[]>([]);

  const getCategoryPermissions = async () => {
    try {
      startLoading();
      const response = await adminServices.getCategoryPermissions();
      if (response.statusCode === 200) {
        categoryPermissions.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getPermissions = async () => {
    try {
      startLoading();
      const params: {
        page?: number;
        per_page?: number;
        name?: string;
        active?: boolean;
        category_permission_id?: string;
      } = {
        page: pagination.page,
        per_page: pagination.per_page,
        name: filter.filter_name,
        active: filter.active === 'Todos' ? undefined : filter.active,
        category_permission_id: filter.category_permission_id,
      };
      const response = await adminServices.getPermissions(params);

      if (response.statusCode === 200) {
        permissions.value = response.data.data;
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

  const addPermission = async (form: PermissionForm) => {
    try {
      startLoading();
      const response = await adminServices.postPermission({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getPermissions();
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

  const editPermission = async (form: PermissionForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await adminServices.putPermission(id!, body);
      if (response.status === 200) {
        getPermissions();
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

  const togglePermission = async (id: string) => {
    try {
      startLoading();
      const response = await adminServices.togglePermission(id);
      if (response.status === 200) {
        getPermissions();
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
      filter.active === undefined &&
      filter.category_permission_id === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.active = undefined;
    filter.category_permission_id = undefined;
    getPermissions();
  };

  const setPermissionItem = (value: PermissionsResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
    setFieldValue('category', value?.category);
  };

  const findPermission = (value: filterType) => {
    if (value) {
      getPermissions();
    }
  };

  const debouncedFindPermission = debounce(() => {
    pagination.page = 1;
    getPermissions();
  }, 700);

  const debouncedCleanSearch = debounce(() => {
    cleanSearch();
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
    getCategoryPermissions,
    validateAlphaInput,
    cleanSearch,
    setPermissionItem,
    findPermission,
    getPermissions,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    active,
    activeAttrs,
    category,
    categoryAttrs,
    alert,
    filter,
    pagination,
    categoryPermissions,
    permissions,
    addPermission,
    editPermission,
    togglePermission,
    debouncedFindPermission,
    debouncedCleanSearch,
  };
}
