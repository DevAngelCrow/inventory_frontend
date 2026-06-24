import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import { debounce } from '@/core/utils/debounceFunction';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import { CountryResponse } from '../interfaces/country.response.interface';
import { GeographicDivisionResponse } from '../interfaces/geographic-division/geographic-division.response.interface';
import { GeographicDivisionForm } from '../interfaces/geographic-division/geographic-division.form.interface';
import { GeographicDivisionTypeSimple } from '../interfaces/geographic-division/geographic-division.type.interface';
import { GeographicDivisionParent } from '../interfaces/geographic-division/geographic-division.parent.interface';
import catalogServices from '../Services/catalog.services';

type filterType = {
  filter?: string;
  status?: boolean | 'Todos';
  id_country?: string;
  id_type?: string;
  id_parent?: string;
};

export function useGeographicDivision() {
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
      description: yup
        .string()
        .min(3, 'La descripción debe tener al menos 3 caracteres')
        .max(255, 'La descripción debe tener menos de 255 caracteres')
        .nullable(),
      country: yup.mixed<CountryResponse>().required('El país es requerido'),
      divisionType: yup
        .mixed<GeographicDivisionTypeSimple>()
        .required('El tipo de división es requerido'),
      parent: yup.mixed<GeographicDivisionParent>().nullable(),
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
      field: 'type.name',
      header: 'Tipo',
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

  const divisions = ref<GeographicDivisionResponse[]>([]);
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
  const [divisionType, divisionTypeAttrs] = defineField('divisionType');
  const [parent, parentAttrs] = defineField('parent');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter: undefined,
    status: undefined,
    id_country: undefined,
    id_type: undefined,
    id_parent: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;

  const countries = ref<CountryResponse[]>([]);
  const divisionTypesList = ref<GeographicDivisionTypeSimple[]>([]);
  const parentDivisionsList = ref<GeographicDivisionParent[]>([]);

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

  const getDivisionTypesList = async (params?: { id_country?: string }) => {
    try {
      startLoading();
      const response = await catalogServices.getAllGeographicDivisionTypes({
        active: true,
        per_page: 100,
        ...(params?.id_country ? { id_country: params.id_country } : {}),
      });
      if (response.statusCode === 200) {
        divisionTypesList.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const getParentDivisionsList = async (params?: { id_country?: string }) => {
    try {
      startLoading();
      const response = await catalogServices.getAllGeographicDivisionsCursor({
        active: true,
        limit: 100,
        ...(params?.id_country ? { id_country: params.id_country } : {}),
      });
      if (response.statusCode === 200) {
        parentDivisionsList.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const getDivisions = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter: filter.filter || undefined,
        active: filter.status === 'Todos' ? undefined : filter.status,
        id_country: filter.id_country || undefined,
        id_type: filter.id_type || undefined,
        id_parent: filter.id_parent || undefined,
      };
      const response = await catalogServices.getAllGeographicDivisions(params);
      if (response.statusCode === 200) {
        divisions.value = response.data.data;
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

  const addDivision = async (form: GeographicDivisionForm) => {
    try {
      startLoading();
      const response = await catalogServices.postGeographicDivision({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getDivisions();
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

  const editDivision = async (form: GeographicDivisionForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      if (!id) return;
      const response = await catalogServices.putGeographicDivision(id, body);
      if (response.status === 200) {
        getDivisions();
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

  const toggleDivision = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.patchGeographicDivision(id);
      if (response.status === 200) {
        getDivisions();
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
      filter.id_country === undefined &&
      filter.id_type === undefined &&
      filter.id_parent === undefined
    ) {
      return;
    }
    filter.filter = undefined;
    filter.status = undefined;
    filter.id_country = undefined;
    filter.id_type = undefined;
    filter.id_parent = undefined;
    getDivisions();
  };

  const setDivisionItem = (value: GeographicDivisionResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
    setFieldValue('country', value?.country);
    setFieldValue('divisionType', value?.type);
    setFieldValue('parent', value?.parent ?? null);
  };

  const findDivision = () => {
    if (
      filter.filter ||
      filter.status !== undefined ||
      filter.id_country !== undefined ||
      filter.id_type !== undefined ||
      filter.id_parent !== undefined
    ) {
      getDivisions();
    }
  };

  
  const debouncedFindDivision = debounce(findDivision, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindDivision,
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
    getDivisions,
    getDivisionTypesList,
    getParentDivisionsList,
    validateAlphaInput,
    cleanSearch,
    setDivisionItem,
    findDivision,
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
    divisionType,
    divisionTypeAttrs,
    parent,
    parentAttrs,
    alert,
    filter,
    pagination,
    countries,
    divisionTypesList,
    parentDivisionsList,
    divisions,
    addDivision,
    editDivision,
    toggleDivision,
  };
}
