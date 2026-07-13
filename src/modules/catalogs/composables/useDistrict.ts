import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { debounce } from '@/core/utils/debounceFunction';
import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import catalogServices from '../Services/catalog.services';
import { MunicipalityResponse } from '../interfaces/municipalities/municipality.response.interface';
import { Municipality } from '../interfaces/districts/districts.municipality.interface';
import { DistrictResponse } from '../interfaces/districts/district.response.interface';
import { DistrictForm } from '../interfaces/districts/district.form.interface';
type filterType = {
  filter_name?: string;
  status?: boolean | 'Todos';
  id_municipality?: string;
};
export function useDistrict() {
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
        .required('El nombre del distrito es requerido')
        .min(3, 'El nombre de tener al menos 3 caracteres')
        .max(150, 'El nombre no puede tener más de 150 caracteres'),
      description: yup
        .string()
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .nullable()
        .max(150, 'La descripción no puede tener más de 150 caracteres'),
      municipality: yup
        .mixed<Municipality>()
        .required('El campo de municipio es requerido'),
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
      field: 'municipality.name',
      header: 'Municipio',
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

  const districts = ref<DistrictResponse[] | undefined>([]);
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
  const [municipality, municipalityAttrs] = defineField('municipality');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
    id_municipality: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;
  const municipalities = ref<MunicipalityResponse[]>([]);

  const getMunicipalities = async () => {
    try {
      startLoading();
      const params = {
        active: true,
      };
      const response = await catalogServices.getMunicipalities(params);
      if (response.statusCode === 200) {
        municipalities.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getDistricts = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        status: filter.status === 'Todos' ? undefined : filter.status,
        id_municipality: filter.id_municipality,
      };
      const response = await catalogServices.getDistricts(params);

      if (response.statusCode === 200) {
        districts.value = response.data.data;
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

  const addDistrict = async (form: DistrictForm) => {
    try {
      startLoading();
      const response = await catalogServices.postDistrict({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getDistricts();
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

  const editDistrict = async (form: DistrictForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await catalogServices.putDistrict(id!, body);
      if (response.status === 200) {
        getDistricts();
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

  const toggleDistrict = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.toggleDistrict(id);
      if (response.status === 200) {
        getDistricts();
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
      filter.id_municipality === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    filter.id_municipality = undefined;
    getDistricts();
  };

  const setDistrictItem = (value: DistrictResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
    setFieldValue('municipality', value?.municipality);
  };

  const findDistrict = () => {
    if (filter.filter_name || filter.status !== undefined) {
      getDistricts();
    }
  };

  const debouncedFindDistrict = debounce(findDistrict, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindDistrict,
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
    getMunicipalities,
    validateAlphaInput,
    cleanSearch,
    setDistrictItem,
    findDistrict,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    active,
    activeAttrs,
    municipality,
    municipalityAttrs,
    alert,
    filter,
    pagination,
    municipalities,
    districts,
    getDistricts,
    addDistrict,
    editDistrict,
    toggleDistrict,
  };
}
