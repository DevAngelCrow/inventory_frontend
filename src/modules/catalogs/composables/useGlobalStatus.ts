import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { debounce } from '@/core/utils/debounceFunction';
import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import catalogServices from '../Services/catalog.services';
import { GlobalStatusResponse } from '../interfaces/global-status/global-status.response.interface';
import { GlobalStatusForm } from '../interfaces/global-status/global-status.form.interface';
import { CategoryStatus } from '../interfaces/global-status/global-status.category-status.interface';
import { CategoryStatusResponse } from '../interfaces/category-status/category-status.response.interface';
type filterType = {
  filter_name?: string;
  status?: boolean | 'Todos';
  id_category?: string;
};
export function useGlobalStatus() {
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
      code: yup.string().required('El campo de cabecera es obligatorio'),
      name: yup
        .string()
        .required('El nombre del departamento es requerido')
        .min(3, 'El nombre de tener al menos 3 caracteres')
        .max(255, 'El nombre no puede tener más de 255 caracteres'),
      description: yup
        .string()
        .required('La descripción es obligatoria')
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(255, 'La descripción no puede tener más de 255 caracteres')
        .nullable(),
      state_color: yup
        .string()
        .max(10, 'El color del estado no puede tener más de 10 caracteres')
        .required('El color del estado es obligatorio'),
      text_color: yup
        .string()
        .max(
          10,
          'El color del texto del estado no puede tener más de 10 caracteres',
        )
        .required('El color del texto del estado es obligatorio'),
      category_status: yup
        .mixed<CategoryStatus>()
        .required('El campo de categoría de estado es obligatorio'),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'code',
      header: 'Código',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
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
      field: 'category_status.name',
      header: 'Categoría',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'state_color',
      header: 'Color',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
    {
      field: 'text_color',
      header: 'Color de texto',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 12,
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

  const globalStatus = ref<GlobalStatusResponse[]>([]);
  const categoryStatuses = ref<CategoryStatusResponse[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [code, codeAttrs] = defineField('code');
  const [name, nameAttrs] = defineField('name');
  const [description, descriptionAttrs] = defineField('description');
  //const [active, activeAttrs] = defineField('active');
  const [state_color, stateColorAttrs] = defineField('state_color');
  const [text_color, textColorAttrs] = defineField('text_color');
  const [category_status, categoryStatusAttrs] = defineField('category_status');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
    id_category: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9_ ]/g;

  const getGlobalStatus = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        status: filter.status === 'Todos' ? undefined : filter.status,
        id_category: filter.id_category,
      };
      const response = await catalogServices.getGlobalStatus(params);

      if (response.statusCode === 200) {
        globalStatus.value = response.data.data;
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

  const addGlobalStatus = async (form: GlobalStatusForm) => {
    try {
      startLoading();
      const response = await catalogServices.postGlobalStatus({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getGlobalStatus();
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

  const editGlobalStatus = async (form: GlobalStatusForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await catalogServices.putGlobalStatus(id!, body);
      if (response.status === 200) {
        getGlobalStatus();
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

  const toggleGlobalStatus = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.toggleGlobalStatus(id);
      if (response.status === 200) {
        getGlobalStatus();
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
  const getCategoryStatuses = async () => {
    try {
      startLoading();
      const filter = {
        status: true,
      };
      const response = await catalogServices.getAllCategoryStatuses(filter);

      if (response.statusCode === 200) {
        const { data } = response;
        categoryStatuses.value = data.data;
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
      filter.status === undefined &&
      filter.id_category === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    filter.id_category = undefined;
    getGlobalStatus();
  };

  const setGlobalStatusItem = (value: GlobalStatusResponse) => {
    setFieldValue('code', value?.code);
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
    setFieldValue('state_color', value?.state_color);
    setFieldValue('text_color', value?.text_color);
    setFieldValue('category_status', value?.category_status);
  };

  const findGlobalStatus = () => {
    if (filter.filter_name || filter.status !== undefined) {
      getGlobalStatus();
    }
  };

  const debouncedFindGlobalStatus = debounce(findGlobalStatus, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindGlobalStatus,
    debouncedCleanSearch,
    headers,
    errors,
    defineField,
    handleSubmit,
    validateField,
    resetForm,
    resetField,
    setFieldError,
    setFieldValue,
    validateAlphaInput,
    cleanSearch,
    setGlobalStatusItem,
    findGlobalStatus,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    code,
    codeAttrs,
    state_color,
    stateColorAttrs,
    text_color,
    textColorAttrs,
    category_status,
    categoryStatusAttrs,
    alert,
    filter,
    pagination,
    globalStatus,
    getGlobalStatus,
    addGlobalStatus,
    editGlobalStatus,
    toggleGlobalStatus,
    getCategoryStatuses,
    categoryStatuses,
  };
}
