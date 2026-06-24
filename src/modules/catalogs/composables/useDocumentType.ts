import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import { debounce } from '@/core/utils/debounceFunction';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import catalogServices from '../Services/catalog.services';
import { DocumentTypeResponse } from '../interfaces/document-type/document-type.response.interface';
import { DocumentTypeForm } from '../interfaces/document-type/document-type.form.interface';
type filterType = { filter_name?: string; status?: boolean | 'Todos' };
export function useDocumentType() {
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
        .required('El nombre del tipo de documento es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre no puede tener más de 150 caracteres'),
      description: yup
        .string()
        .required('La descripción es requerida')
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(150, 'La descripción no puede tener más de 150 caracteres'),
      mask: yup
        .string()
        .nullable()
        .max(150, 'La máscara no puede tener más de 150 caracteres'),
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
      field: 'mask',
      header: 'Máscara',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
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

  const documentTypes = ref<DocumentTypeResponse[] | undefined>([]);
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
  const [mask, maskAttrs] = defineField('mask');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;

  const getDocumentTypes = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        status: filter.status === 'Todos' ? undefined : filter.status,
      };
      const response = await catalogServices.getDocumentTypes(params);

      if (response.statusCode === 200) {
        documentTypes.value = response.data.data;
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

  const addDocumentType = async (form: DocumentTypeForm) => {
    try {
      startLoading();
      const response = await catalogServices.postDocumentType({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getDocumentTypes();
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

  const editDocumentType = async (form: DocumentTypeForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await catalogServices.putDocumentType(id!, body);
      if (response.status === 200) {
        getDocumentTypes();
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

  const toggleDocumentType = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.toggleDocumentType(id);
      if (response.status === 200) {
        getDocumentTypes();
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
      filter.status === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    getDocumentTypes();
  };

  const setDocumentTypeItem = (value: DocumentTypeResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('mask', value?.mask);
    setFieldValue('active', value?.active);
  };

  const findDocumentType = () => {
    if (filter.filter_name || filter.status !== undefined) {
      getDocumentTypes();
    }
  };

  
  const debouncedFindDocumentType = debounce(findDocumentType, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindDocumentType,
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
    setDocumentTypeItem,
    findDocumentType,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    mask,
    maskAttrs,
    active,
    activeAttrs,
    alert,
    filter,
    pagination,
    documentTypes,
    getDocumentTypes,
    addDocumentType,
    editDocumentType,
    toggleDocumentType,
  };
}
