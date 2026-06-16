import { useForm } from 'vee-validate';
import { nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { sanitizedValueInput } from '@/core/utils/inputTextValidations';

import { CustomerResponse, CustomerForm } from '../interfaces/customer.interfaces';
import customerServices from '../Services/customer.services';

type filterType = { filter?: string; active?: boolean | 'Todos' };

export function useCustomer() {
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
      first_name: yup
        .string()
        .required('El nombre es requerido')
        .min(2, 'Debe tener al menos 2 caracteres'),
      last_name: yup
        .string()
        .required('El apellido es requerido')
        .min(2, 'Debe tener al menos 2 caracteres'),
      email: yup
        .string()
        .email('Debe ser un correo válido')
        .nullable()
        .transform((value) => (value === '' ? null : value)),
      phone: yup
        .string()
        .required('El teléfono es requerido'),
      phone_secondary: yup.string().nullable(),
      company_name: yup.string().nullable(),
      tax_id: yup.string().nullable(),
      address_line1: yup.string().nullable(),
      address_line2: yup.string().nullable(),
      city: yup.string().nullable(),
      state: yup.string().nullable(),
      zip_code: yup.string().nullable(),
      notes: yup.string().nullable(),
      active: yup.boolean(),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'first_name',
      header: 'Nombre',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'last_name',
      header: 'Apellido',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'phone',
      header: 'Teléfono',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
      width: 15,
    },
    {
      field: 'email',
      header: 'Email',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
      width: 25,
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

  const customers = ref<CustomerResponse[]>([]);
  const customerHistory = ref<any[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });

  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [first_name, firstNameAttrs] = defineField('first_name');
  const [last_name, lastNameAttrs] = defineField('last_name');
  const [email, emailAttrs] = defineField('email');
  const [phone, phoneAttrs] = defineField('phone');
  const [phone_secondary, phoneSecondaryAttrs] = defineField('phone_secondary');
  const [company_name, companyNameAttrs] = defineField('company_name');
  const [tax_id, taxIdAttrs] = defineField('tax_id');
  const [address_line1, addressLine1Attrs] = defineField('address_line1');
  const [address_line2, addressLine2Attrs] = defineField('address_line2');
  const [city, cityAttrs] = defineField('city');
  const [state, stateAttrs] = defineField('state');
  const [zip_code, zipCodeAttrs] = defineField('zip_code');
  const [notes, notesAttrs] = defineField('notes');
  const [active, activeAttrs] = defineField('active');

  const filter = reactive<filterType>({
    filter: undefined,
    active: undefined,
  });
  const findRegex = /[^a-zA-ZáÁéÉíÍóÓúÚñÑ.0-9 @_-]/g;

  const getCustomers = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        filter_name: filter.filter,
        status: filter.active === 'Todos' ? undefined : filter.active as boolean | undefined,
      };
      const response = await customerServices.getCustomers(params);

      if (response.statusCode === 200) {
        customers.value = response.data.data;
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

  const addCustomer = async (form: CustomerForm) => {
    try {
      startLoading();
      const response = await customerServices.postCustomer(form);
      if (response.status === 201) {
        getCustomers();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Cliente registrado con éxito'}`,
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

  const editCustomer = async (form: CustomerForm) => {
    try {
      startLoading();
      const { id, active, ...body } = form;
      const response = await customerServices.putCustomer(id!, body);
      if (response.status === 200) {
        getCustomers();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Cliente actualizado con éxito'}`,
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

  const patchCustomer = async (id: string) => {
    try {
      startLoading();
      const response = await customerServices.toggleCustomer(id);
      if (response.status === 200) {
        getCustomers();
        alert.showAlert({
          type: 'success',
          title: `${response.data.message || 'Estado del cliente modificado'}`,
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

  const getHistory = async (id: string) => {
    try {
      startLoading();
      const response = await customerServices.getCustomerHistory(id);
      if (response.statusCode === 200) {
        customerHistory.value = response.data;
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
      filter.filter = sanitizedValue;
    });
  };

  const cleanSearch = () => {
    filter.filter = undefined;
    filter.active = undefined;
    getCustomers();
  };

  const setCustomerItem = (value: CustomerResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('first_name', value?.first_name);
    setFieldValue('last_name', value?.last_name);
    setFieldValue('email', value?.email);
    setFieldValue('phone', value?.phone);
    setFieldValue('phone_secondary', value?.phone_secondary);
    setFieldValue('company_name', value?.company_name);
    setFieldValue('tax_id', value?.tax_id);
    setFieldValue('address_line1', value?.address_line1);
    setFieldValue('address_line2', value?.address_line2);
    setFieldValue('city', value?.city);
    setFieldValue('state', value?.state);
    setFieldValue('zip_code', value?.zip_code);
    setFieldValue('notes', value?.notes);
    setFieldValue('active', value?.active);
  };

  const findCustomer = () => {
    getCustomers();
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
    getCustomers,
    addCustomer,
    editCustomer,
    patchCustomer,
    getHistory,
    validateAlphaInput,
    cleanSearch,
    setCustomerItem,
    findCustomer,
    id,
    idAttrs,
    first_name,
    firstNameAttrs,
    last_name,
    lastNameAttrs,
    email,
    emailAttrs,
    phone,
    phoneAttrs,
    phone_secondary,
    phoneSecondaryAttrs,
    company_name,
    companyNameAttrs,
    tax_id,
    taxIdAttrs,
    address_line1,
    addressLine1Attrs,
    address_line2,
    addressLine2Attrs,
    city,
    cityAttrs,
    state,
    stateAttrs,
    zip_code,
    zipCodeAttrs,
    notes,
    notesAttrs,
    active,
    activeAttrs,
    alert,
    filter,
    pagination,
    customers,
    customerHistory,
  };
}
