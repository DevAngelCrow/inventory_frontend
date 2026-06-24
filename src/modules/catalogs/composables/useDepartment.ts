import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import { debounce } from '@/core/utils/debounceFunction';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import { Country } from '../interfaces/deparments/deparment.country.interface';
import { DepartmentResponse } from '../interfaces/deparments/department.response.interface';
import catalogServices from '../Services/catalog.services';
import { CountryResponse } from '../interfaces/country.response.interface';
import { DepartmentForm } from '../interfaces/deparments/deparment.form.interface';

type filterType = {
  filter_name?: string;
  status?: boolean | 'Todos';
  id_country?: string;
};
export function useDepartment() {
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
        .required('El nombre del departamento es requerido')
        .min(3, 'El nombre de tener al menos 3 caracteres')
        .max(150, 'El nombre debe tener menos de 150 caracteres'),
      description: yup
        .string()
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(150, 'La descripción debe tener menos de 150 caracteres')
        .nullable(),
      country: yup.mixed<Country>().required('El campo del país es requerido'),
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
      field: 'country.name',
      header: 'País',
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

  const deparments = ref<DepartmentResponse[] | undefined>([]);
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
  const [country, countryAttrs] = defineField('country');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
    id_country: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;
  const countries = ref<CountryResponse[]>([]);

  const getCountries = async () => {
    try {
      startLoading();
      const params = {
        status: true,
      };
      const response = await catalogServices.getAllCountries(params);
      if (response.statusCode === 200) {
        countries.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getDepartments = async () => {
    try {
      startLoading();
      const params: {
        page?: number;
        per_page?: number;
        filter_name?: string | null;
        status?: boolean | null;
        id_country?: string | null;
      } = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        status: filter.status === 'Todos' ? undefined : filter.status,
        id_country: filter.id_country,
      };
      const response = await catalogServices.getAllDepartments(params);

      if (response.statusCode === 200) {
        deparments.value = response.data.data;
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

  const addDepartment = async (form: DepartmentForm) => {
    try {
      startLoading();
      const response = await catalogServices.postDepartment({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getDepartments();
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

  const editDepartment = async (form: DepartmentForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await catalogServices.putDepartment(id!, body);
      if (response.status === 200) {
        getDepartments();
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

  const toggleDepartment = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.toggleDepartment(id);
      if (response.status === 200) {
        getDepartments();
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
      filter.status === undefined &&
      filter.id_country === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    filter.id_country = undefined;
    getDepartments();
  };

  const setDepartmenItem = (value: DepartmentResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
    setFieldValue('country', value?.country);
  };

  const findDepartment = (value: filterType) => {
    if (
      value.filter_name ||
      value.status !== undefined ||
      value.id_country !== undefined
    ) {
      getDepartments();
    }
  };
  
  const debouncedFindDepartment = debounce(findDepartment, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindDepartment,
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
    getDepartments,
    validateAlphaInput,
    cleanSearch,
    setDepartmenItem,
    findDepartment,
    getCountries,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    active,
    activeAttrs,
    country,
    countryAttrs,
    alert,
    filter,
    pagination,
    countries,
    deparments,
    addDepartment,
    editDepartment,
    toggleDepartment,
  };
}
