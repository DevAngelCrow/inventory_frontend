import { useForm } from 'vee-validate';
import { reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';

import { ProductMaintenanceResponse, ProductMaintenanceForm, ProductResponse, CreateMaintenancePayload, ResolveMaintenancePayload, UpdateMaintenancePayload } from '../interfaces/inventory.interfaces';
import inventoryServices from '../Services/inventory.services';

type filterType = {
  id_product?: string;
  resolved?: boolean | 'Todos';
};

export function useMaintenance() {
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
      description: yup
        .string()
        .required('La descripción del mantenimiento es requerida')
        .max(500, 'La descripción no puede tener más de 500 caracteres'),
      cost: yup
        .number()
        .typeError('El costo debe ser un número')
        .min(0, 'El costo no puede ser negativo')
        .nullable(),
      quantity: yup
        .number()
        .typeError('La cantidad debe ser un número entero')
        .integer('La cantidad debe ser un número entero')
        .required('La cantidad de artículos es requerida')
        .min(1, 'La cantidad mínima es 1'),
      date_start: yup
        .string()
        .required('La fecha de inicio es requerida'),
      date_end: yup
        .string()
        .nullable(),
      resolved: yup.boolean(),
      id_product: yup.string().required('El producto es requerido'),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'id_product',
      header: 'Producto',
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
      field: 'quantity',
      header: 'Cantidad',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 10,
    },
    {
      field: 'date_start',
      header: 'Fecha Inicio',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 15,
    },
    {
      field: 'resolved',
      header: 'Estado',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
      width: 12,
    },
    {
      field: 'acciones',
      header: 'Acciones',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
  ]);

  const maintenances = ref<ProductMaintenanceResponse[]>([]);
  const productsList = ref<ProductResponse[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });

  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [description, descriptionAttrs] = defineField('description');
  const [cost, costAttrs] = defineField('cost');
  const [quantity, quantityAttrs] = defineField('quantity');
  const [date_start, dateStartAttrs] = defineField('date_start');
  const [date_end, dateEndAttrs] = defineField('date_end');
  const [resolved, resolvedAttrs] = defineField('resolved');
  const [id_product, idProductAttrs] = defineField('id_product');

  const filter = reactive<filterType>({
    id_product: undefined,
    resolved: undefined,
  });

  const getMaintenances = async () => {
    try {
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        id_product: filter.id_product === 'Todos' ? undefined : filter.id_product,
        resolved: filter.resolved === 'Todos' ? undefined : filter.resolved as boolean | undefined,
      };
      const response = await inventoryServices.getMaintenances(params);

      if (response.statusCode === 200) {
        maintenances.value = response.data.data;
        pagination.page = response.data.current_page;
        pagination.per_page = response.data.per_page;
        pagination.total_items = response.data.total_items;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await inventoryServices.getProducts({ active: true, per_page: 100 });
      if (response.statusCode === 200) {
        productsList.value = response.data.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addMaintenance = async (form: ProductMaintenanceForm) => {
    try {
      startLoading();
      const createPayload: CreateMaintenancePayload = {
        description: form.description,
        cost: form.cost,
        quantity: form.quantity,
        date_start: form.date_start,
        date_end: form.date_end,
        id_product: form.id_product,
      };
      const response = await inventoryServices.postMaintenance(createPayload);
      if (response.status === 201) {
        getMaintenances();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Mantenimiento registrado con éxito'}`,
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

  const editMaintenance = async (form: ProductMaintenanceForm) => {
    try {
      startLoading();
      const { id, date_end, cost, resolved, description, quantity, date_start, id_product } = form;

      const updatePayload: UpdateMaintenancePayload = {
        description,
        quantity,
        date_start,
        id_product,
        cost,
      };

      const updateResponse = await inventoryServices.putMaintenance(id!, updatePayload);

      if (resolved) {
        if (!date_end) {
          alert.showAlert({ type: 'error', title: 'Fecha de resolución es requerida para resolver', show: true });
          finishLoading();
          return false;
        }
        const resolvePayload: ResolveMaintenancePayload = {
          date_end,
          cost,
        };
        await inventoryServices.resolveMaintenance(id!, resolvePayload);
      }

      if (updateResponse.status === 200) {
        getMaintenances();
        alert.showAlert({
          type: 'success',
          title: `Mantenimiento ${resolved ? 'resuelto' : 'actualizado'} con éxito`,
          show: true,
        });
        return updateResponse.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const cleanSearch = async () => {
    startLoading();
    filter.id_product = undefined;
    filter.resolved = undefined;
    await getMaintenances();
    finishLoading();
  };

  const setMaintenanceItem = (value: ProductMaintenanceResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('description', value?.description);
    setFieldValue('cost', value?.cost ? Number(value?.cost) : undefined);
    setFieldValue('quantity', value?.quantity);
    setFieldValue('date_start', value?.date_start);
    setFieldValue('date_end', value?.date_end);
    setFieldValue('resolved', value?.resolved);
    setFieldValue('id_product', value?.id_product);
  };

  const findMaintenance = async () => {
    startLoading();
    await getMaintenances();
    finishLoading();
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
    getMaintenances,
    loadProducts,
    cleanSearch,
    setMaintenanceItem,
    findMaintenance,
    id,
    idAttrs,
    description,
    descriptionAttrs,
    cost,
    costAttrs,
    quantity,
    quantityAttrs,
    date_start,
    dateStartAttrs,
    date_end,
    dateEndAttrs,
    resolved,
    resolvedAttrs,
    id_product,
    idProductAttrs,
    alert,
    filter,
    pagination,
    maintenances,
    productsList,
    addMaintenance,
    editMaintenance,
  };
}
