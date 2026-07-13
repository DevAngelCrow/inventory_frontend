import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { debounce } from '@/core/utils/debounceFunction';

import adminServices from '../services/admin.services';
import { CategoryPermissionsResponse } from '../interfaces/category-permissions/category-permissions-response.interface';
import { CategoryPermissionForm } from '../interfaces/category-permissions/category-permission-form.interface';
type filterType = { filter_name?: string; status?: boolean | 'Todos' };
export function useCategoryPermission() {
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
        .required('El nombre de la categoría es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(255, 'El nombre debe tener como máximo 255 caracteres'),
      description: yup
        .string()
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(255, 'La descripción debe tener como máximo 255 caracteres')
        .nullable(),
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

  const categories = ref<CategoryPermissionsResponse[] | undefined>([]);
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
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9- ]/g;

  const getCategoryPermissions = async () => {
    try {
      startLoading();
      const params: {
        page?: number;
        per_page?: number;
        name?: string;
        active?: boolean;
      } = {
        page: pagination.page,
        per_page: pagination.per_page,
        name: filter.filter_name,
        active: filter.status === 'Todos' ? undefined : filter.status,
      };
      const response = await adminServices.getCategoryPermissions(params);
      if (response.statusCode === 200) {
        categories.value = response.data.data;
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

  const addCategoryPermission = async (form: CategoryPermissionForm) => {
    try {
      startLoading();
      const response = await adminServices.postCategoryPermission({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getCategoryPermissions();
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

  const editCategoryPermission = async (form: CategoryPermissionForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await adminServices.putCategoryPermission(id!, body);
      if (response.status === 200) {
        getCategoryPermissions();
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

  const toggleCategoryPermission = async (id: string) => {
    try {
      startLoading();
      const response = await adminServices.toggleCategoryPermission(id);
      if (response.status === 200) {
        getCategoryPermissions();
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
      (filter.status === undefined || filter.status === 'Todos')
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    getCategoryPermissions();
  };

  const setCategoryPermissionItem = (value: CategoryPermissionsResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
  };

  const findCategoryPermission = (value: filterType) => {
    if (value) {
      getCategoryPermissions();
    }
  };

  const debouncedFindCategoryPermission = debounce(() => {
    pagination.page = 1;
    getCategoryPermissions();
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
    setCategoryPermissionItem,
    findCategoryPermission,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    active,
    activeAttrs,
    alert,
    filter,
    pagination,
    addCategoryPermission,
    editCategoryPermission,
    toggleCategoryPermission,
    categories,
    debouncedFindCategoryPermission,
    debouncedCleanSearch,
  };
}
