import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';
import { debounce } from '@/core/utils/debounceFunction';

import {
  MeasurementUnitResponse,
  MeasurementUnitForm,
  CreateMeasurementUnitPayload,
  UpdateMeasurementUnitPayload,
} from '../interfaces/inventory.interfaces';
import inventoryServices from '../Services/inventory.services';

type filterType = {
  filter_name?: string;
  active?: boolean | 'Todos' | '';
};

export function useMeasurementUnit() {
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
        .required('El nombre de la unidad es requerido')
        .min(1, 'El nombre debe tener al menos 1 caracter')
        .max(100, 'El nombre no puede tener más de 100 caracteres'),
      abbreviation: yup
        .string()
        .required('La abreviatura es requerida')
        .max(20, 'La abreviatura no puede tener más de 20 caracteres'),
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
      field: 'abbreviation',
      header: 'Abreviatura',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
      width: 45,
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

  const measurementUnits = ref<MeasurementUnitResponse[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });

  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [name, nameAttrs] = defineField('name');
  const [abbreviation, abbreviationAttrs] = defineField('abbreviation');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    active: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;

  const getMeasurementUnits = async () => {
    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        active: (filter.active === 'Todos' || filter.active === ''
          ? undefined
          : filter.active) as boolean | undefined,
      };
      const response = await inventoryServices.getMeasurementUnits(params);

      if (response.statusCode === 200) {
        measurementUnits.value = response.data.data;
        pagination.page = response.data.current_page;
        pagination.per_page = response.data.per_page;
        pagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addMeasurementUnit = async (form: MeasurementUnitForm) => {
    try {
      startLoading();
      const createPayload: CreateMeasurementUnitPayload = {
        name: form.name,
        abbreviation: form.abbreviation,
      };
      const response =
        await inventoryServices.postMeasurementUnit(createPayload);
      if (response.status === 201) {
        await getMeasurementUnits();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Unidad de medida creada con éxito'}`,
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

  const editMeasurementUnit = async (form: MeasurementUnitForm) => {
    try {
      startLoading();
      const { id, name, abbreviation } = form;
      const updatePayload: UpdateMeasurementUnitPayload = {
        name,
        abbreviation,
      };
      const response = await inventoryServices.putMeasurementUnit(
        id!,
        updatePayload,
      );
      if (response.status === 200) {
        await getMeasurementUnits();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Unidad de medida actualizada con éxito'}`,
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

  const patchMeasurementUnit = async (id: string) => {
    try {
      startLoading();
      const response = await inventoryServices.toggleMeasurementUnit(id);
      if (response.status === 200) {
        await getMeasurementUnits();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Estado de unidad modificado'}`,
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

  const cleanSearch = async () => {
    if (
      (!filter.filter_name || filter.filter_name === '') &&
      filter.active === undefined
    ) {
      return;
    }
    startLoading();
    filter.filter_name = undefined;
    filter.active = 'Todos';
    await getMeasurementUnits();
    finishLoading();
  };

  const setMeasurementUnitItem = (value: MeasurementUnitResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('abbreviation', value?.abbreviation);
    setFieldValue('active', value?.active);
  };

  const findMeasurementUnit = async () => {
    if (filter.filter_name || filter.active !== undefined) {
      startLoading();
      await getMeasurementUnits();
      finishLoading();
    }
  };

  const debouncedFindMeasurementUnit = debounce(findMeasurementUnit, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

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
    getMeasurementUnits,
    validateAlphaInput,
    cleanSearch,
    debouncedCleanSearch,
    setMeasurementUnitItem,
    findMeasurementUnit,
    debouncedFindMeasurementUnit,
    id,
    idAttrs,
    name,
    nameAttrs,
    abbreviation,
    abbreviationAttrs,
    active,
    activeAttrs,
    alert,
    filter,
    pagination,
    measurementUnits,
    addMeasurementUnit,
    editMeasurementUnit,
    patchMeasurementUnit,
  };
}
