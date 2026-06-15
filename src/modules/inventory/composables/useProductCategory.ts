import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import { ProductCategoryResponse, ProductCategoryForm } from '../interfaces/inventory.interfaces';
import inventoryServices from '../Services/inventory.services';

type filterType = { filter_name?: string; status?: boolean | 'Todos' };

export function useProductCategory() {
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
      id: yup.string().nullable(),
      name: yup
        .string()
        .required('El nombre de la categoría es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre no puede tener más de 150 caracteres'),
      description: yup
        .string()
        .max(255, 'La descripción no puede tener más de 255 caracteres')
        .nullable(),
      icon: yup
        .string()
        .max(100, 'El icono no puede tener más de 100 caracteres')
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
      width: 45,
    },
    {
      field: 'icon',
      header: 'Icono',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
    },
    {
      field: 'active',
      header: 'Estado',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
    },
    {
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
  ]);

  const categories = ref<ProductCategoryResponse[] | undefined>([]);
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
  const [icon, iconAttrs] = defineField('icon');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;

  const getCategories = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        status: filter.status === 'Todos' ? undefined : filter.status,
      };
      const response = await inventoryServices.getCategories(params);

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

  const addCategory = async (form: ProductCategoryForm) => {
    try {
      startLoading();
      const response = await inventoryServices.postCategory({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getCategories();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Categoría creada con éxito'}`,
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

  const editCategory = async (form: ProductCategoryForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await inventoryServices.putCategory(id!, body);
      if (response.status === 200) {
        getCategories();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Categoría actualizada con éxito'}`,
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

  const patchCategory = async (id: string) => {
    try {
      startLoading();
      const response = await inventoryServices.toggleCategory(id);
      if (response.status === 200) {
        getCategories();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Estado de categoría modificado'}`,
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
    value: string | null | undefined,
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
      filter.status === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    getCategories();
  };

  const setCategoryItem = (value: ProductCategoryResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('icon', value?.icon);
    setFieldValue('active', value?.active);
  };

  const findCategory = (value: filterType) => {
    if (value.filter_name || value.status !== undefined) {
      getCategories();
    }
  };

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
    getCategories,
    validateAlphaInput,
    cleanSearch,
    setCategoryItem,
    findCategory,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    icon,
    iconAttrs,
    active,
    activeAttrs,
    alert,
    filter,
    pagination,
    categories,
    addCategory,
    editCategory,
    patchCategory,
  };
}
