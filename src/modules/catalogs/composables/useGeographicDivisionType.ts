import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import { debounce } from '@/core/utils/debounceFunction';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import { CountryResponse } from '../interfaces/country.response.interface';
import { GeographicDivisionTypeResponse } from '../interfaces/geographic-division-type/geographic-division-type.response.interface';
import { GeographicDivisionTypeForm } from '../interfaces/geographic-division-type/geographic-division-type.form.interface';
import catalogServices from '../Services/catalog.services';

type filterType = {
  filter?: string;
  status?: boolean | 'Todos';
  id_country?: string;
};

export function useGeographicDivisionType() {
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
        .required('El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(150, 'El nombre debe tener menos de 150 caracteres'),
      level: yup
        .number()
        .typeError('El nivel debe ser un número')
        .required('El nivel es requerido')
        .min(1, 'El nivel debe ser mayor o igual a 1'),
      country: yup.mixed<CountryResponse>().required('El país es requerido'),
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
      field: 'level',
      header: 'Nivel',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
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

  const divisionTypes = ref<GeographicDivisionTypeResponse[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [name, nameAttrs] = defineField('name');
  const [level, levelAttrs] = defineField('level');
  const [country, countryAttrs] = defineField('country');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter: undefined,
    status: undefined,
    id_country: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;
  const countries = ref<CountryResponse[]>([]);

  const getCountries = async () => {
    try {
      startLoading();
      const response = await catalogServices.getAllCountries({ status: true });
      if (response.statusCode === 200) {
        countries.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const getDivisionTypes = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter: filter.filter || undefined,
        active: filter.status === 'Todos' ? undefined : filter.status,
        id_country: filter.id_country || undefined,
      };
      const response =
        await catalogServices.getAllGeographicDivisionTypes(params);
      if (response.statusCode === 200) {
        divisionTypes.value = response.data.data;
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

  const addDivisionType = async (form: GeographicDivisionTypeForm) => {
    try {
      startLoading();
      const response = await catalogServices.postGeographicDivisionType({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getDivisionTypes();
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

  const editDivisionType = async (form: GeographicDivisionTypeForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      if (!id) return;
      const response = await catalogServices.putGeographicDivisionType(
        id,
        body,
      );
      if (response.status === 200) {
        getDivisionTypes();
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

  const toggleDivisionType = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.patchGeographicDivisionType(id);
      if (response.status === 200) {
        getDivisionTypes();
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
      filter.filter = sanitizedValue;
    });
  };

  const cleanSearch = () => {
    if (
      (!filter.filter || filter.filter === '') &&
      filter.status === undefined &&
      filter.id_country === undefined
    ) {
      return;
    }
    filter.filter = undefined;
    filter.status = undefined;
    filter.id_country = undefined;
    getDivisionTypes();
  };

  const setDivisionTypeItem = (value: GeographicDivisionTypeResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('level', value?.level);
    setFieldValue('active', value?.active);
    setFieldValue('country', value?.country);
  };

  const findDivisionType = (value: filterType) => {
    if (
      value.filter ||
      value.status !== undefined ||
      value.id_country !== undefined
    ) {
      getDivisionTypes();
    }
  };

  
  const debouncedFindDivisionType = debounce(findDivisionType, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindDivisionType,
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
    getDivisionTypes,
    pagination,
    validateAlphaInput,
    cleanSearch,
    setDivisionTypeItem,
    findDivisionType,
    getCountries,
    id,
    idAttrs,
    name,
    nameAttrs,
    level,
    levelAttrs,
    active,
    activeAttrs,
    country,
    countryAttrs,
    alert,
    filter,
    countries,
    divisionTypes,
    addDivisionType,
    editDivisionType,
    toggleDivisionType,
  };
}
