import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { debounce } from '@/core/utils/debounceFunction';
import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import catalogServices from '../Services/catalog.services';
import { MunicipalityResponse } from '../interfaces/municipalities/municipality.response.interface';
import { MunicipalityForm } from '../interfaces/municipalities/municipality.form.interface';
import { Department } from '../interfaces/municipalities/municipality.department.interface';
import { DepartmentResponse } from '../interfaces/deparments/department.response.interface';
type filterType = {
  filter_name?: string;
  status?: boolean | 'Todos';
  id_department?: string;
};
export function useMunicipality() {
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
        .max(150, 'El nombre no puede tener más de 255 caracteres'),
      description: yup
        .string()
        .required('La descripción es requerida')
        .min(5, 'La descripción debe tener al menos 5 caracteres')
        .max(150, 'La descripción no puede tener más de 255 caracteres')
        .nullable(),
      department: yup
        .mixed<Department>()
        .required('El campo de departamento es requerido'),
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
      field: 'department.name',
      header: 'Departamento',
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

  const municipalities = ref<MunicipalityResponse[] | undefined>([]);
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
  const [department, departmentAttrs] = defineField('department');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter_name: undefined,
    status: undefined,
    id_department: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 ]/g;
  const departments = ref<DepartmentResponse[]>([]);

  const getDepartments = async () => {
    try {
      startLoading();
      const params = {
        active: true,
      };
      const response = await catalogServices.getAllDepartments(params);
      if (response.statusCode === 200) {
        departments.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };
  const getMunicipalities = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter_name,
        status: filter.status === 'Todos' ? undefined : filter.status,
        id_department: filter.id_department,
      };
      const response = await catalogServices.getMunicipalities(params);

      if (response.statusCode === 200) {
        municipalities.value = response.data.data;
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

  const addMunicipality = async (form: MunicipalityForm) => {
    try {
      startLoading();
      const response = await catalogServices.postMunicipality({
        ...form,
        active: true,
      });
      if (response.status === 201) {
        getMunicipalities();
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

  const editMunicipality = async (form: MunicipalityForm) => {
    try {
      startLoading();
      const { id, ...body } = form;
      const response = await catalogServices.putMunicipality(id!, body);
      if (response.status === 200) {
        getMunicipalities();
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

  const toggleMunicipality = async (id: string) => {
    try {
      startLoading();
      const response = await catalogServices.toggleMunicipality(id);
      if (response.status === 200) {
        getMunicipalities();
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
      filter.id_department === undefined
    ) {
      return;
    }
    filter.filter_name = undefined;
    filter.status = undefined;
    filter.id_department = undefined;
    getMunicipalities();
  };

  const setMunicipalityItem = (value: MunicipalityResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('name', value?.name);
    setFieldValue('description', value?.description);
    setFieldValue('active', value?.active);
    setFieldValue('department', value?.department);
  };

  const findMunicipality = () => {
    if (filter.filter_name || filter.status !== undefined) {
      getMunicipalities();
    }
  };

  const debouncedFindMunicipality = debounce(findMunicipality, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  return {
    debouncedFindMunicipality,
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
    setMunicipalityItem,
    findMunicipality,
    id,
    idAttrs,
    name,
    nameAttrs,
    description,
    descriptionAttrs,
    active,
    activeAttrs,
    department,
    departmentAttrs,
    alert,
    filter,
    pagination,
    departments,
    municipalities,
    getMunicipalities,
    addMunicipality,
    editMunicipality,
    toggleMunicipality,
  };
}
