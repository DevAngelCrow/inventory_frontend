import { useForm } from 'vee-validate';
import { computed, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { FormatDateToISO, FormatDate } from '@/core/utils/dates';
import { debounce } from '@/core/utils/debounceFunction';

import { ReservationResponse, ReservationForm } from '../interfaces/reservation.interfaces';
import reservationServices from '../Services/reservation.services';
import customerServices from '../../customers/Services/customer.services';
import inventoryServices from '../../inventory/Services/inventory.services';
import { CustomerResponse } from '../../customers/interfaces/customer.interfaces';
import { ProductResponse } from '../../inventory/interfaces/inventory.interfaces';

type filterType = {
  status?: string;
  id_customer?: string;
  start_date?: string;
  end_date?: string;
};

export function useReservation() {
  const {
    errors,
    defineField,
    handleSubmit,
    validateField,
    resetForm,
    resetField,
    setFieldError,
    setFieldValue,
    values,
  } = useForm({
    validationSchema: yup.object({
      id: yup.string().nullable(),
      id_customer: yup.string().required('El cliente es requerido'),
      event_start: yup.string().required('La fecha/hora de inicio es requerida'),
      event_end: yup.string().required('La fecha/hora de fin es requerida'),
      delivery_address: yup.string().max(500, 'Dirección muy larga').nullable(),
      delivery_address_line2: yup.string().max(255, 'Dirección muy larga').nullable(),
      delivery_zip: yup.string().max(20, 'Código postal muy largo').nullable(),
      delivery_notes: yup.string().nullable(),
      id_customer_address: yup.string().nullable(),
      id_geographic_division: yup.string().nullable(),
      discount_amount: yup.number().typeError('Debe ser número').min(0).default(0),
      delivery_fee: yup.number().typeError('Debe ser número').min(0).default(0),
      deposit_amount: yup.number().typeError('Debe ser número').min(0).default(0),
      notes: yup.string().nullable(),
      status: yup.string().nullable(),
    }),
  });

  const headers = ref<TableHeaders[]>([
    {
      field: 'reservation_number',
      header: 'N° Reserva',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'mnt_customer.first_name',
      header: 'Cliente',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'event_start',
      header: 'Fecha Evento',
      sortable: false,
      alignHeaders: 'center',
      alignItems: 'center',
    },
    {
      field: 'total_amount',
      header: 'Total',
      sortable: false,
      alignHeaders: 'end',
      alignItems: 'end',
    },
    {
      field: 'balance_due',
      header: 'Saldo Pendiente',
      sortable: false,
      alignHeaders: 'end',
      alignItems: 'end',
    },
    {
      field: 'mnt_customer.full_address',
      header: 'Dirección Cliente',
      sortable: false,
      alignHeaders: 'start',
      alignItems: 'start',
    },
    {
      field: 'status',
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
      alignItems: 'start',
      width: 17
    },
  ]);

  const reservations = ref<ReservationResponse[]>([]);
  const customersList = ref<CustomerResponse[]>([]);
  const productsList = ref<ProductResponse[]>([]);

  // Basket/Cart items for adding products to reservation
  const cartItems = ref<{
    id_product: string;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    notes?: string;
  }[]>([]);

  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });

  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id, idAttrs] = defineField('id');
  const [id_customer, idCustomerAttrs] = defineField('id_customer');
  const [event_start, eventStartAttrs] = defineField('event_start');
  const [event_end, eventEndAttrs] = defineField('event_end');
  const [delivery_address, deliveryAddressAttrs] = defineField('delivery_address');
  const [delivery_address_line2, deliveryAddressLine2Attrs] = defineField('delivery_address_line2');
  const [delivery_zip, deliveryZipAttrs] = defineField('delivery_zip');
  const [delivery_notes, deliveryNotesAttrs] = defineField('delivery_notes');
  const [id_customer_address, idCustomerAddressAttrs] = defineField('id_customer_address');
  const [id_geographic_division, idGeographicDivisionAttrs] = defineField('id_geographic_division');
  const [discount_amount, discountAmountAttrs] = defineField('discount_amount');
  const [delivery_fee, deliveryFeeAttrs] = defineField('delivery_fee');
  const [deposit_amount, depositAmountAttrs] = defineField('deposit_amount');
  const [notes, notesAttrs] = defineField('notes');
  const [status] = defineField('status');

  const delivery_datetime = ref<string | undefined>(undefined);
  const pickup_datetime = ref<string | undefined>(undefined);

  const filter = reactive<filterType>({
    status: undefined,
    id_customer: undefined,
    start_date: undefined,
    end_date: undefined,
  });

  // Calculate Subtotal and Totals from Cart Items
  const cartSubtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.subtotal, 0);
  });

  const taxRate = 0.13; // default local tax rate (IVA)

  const cartTaxAmount = computed(() => {
    return cartSubtotal.value * taxRate;
  });

  const cartTotal = computed(() => {
    const disc = values.discount_amount ? Number(values.discount_amount) : 0;
    const fee = values.delivery_fee ? Number(values.delivery_fee) : 0;
    return cartSubtotal.value + cartTaxAmount.value + fee - disc;
  });

  const cartBalanceDue = computed(() => {
    const dep = values.deposit_amount ? Number(values.deposit_amount) : 0;
    return Math.max(0, cartTotal.value - dep);
  });

  const getReservations = async () => {
    try {
      startLoading();
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        status: filter.status === 'Todos' ? undefined : filter.status,
        id_customer: filter.id_customer === 'Todos' ? undefined : filter.id_customer,
        start_date: filter.start_date ? FormatDateToISO(filter.start_date, 'DD/MM/YYYY') : undefined,
        end_date: filter.end_date ? FormatDateToISO(filter.end_date, 'DD/MM/YYYY') : undefined,
      };
      const response = await reservationServices.getReservations(params);

      if (response.statusCode === 200) {
        reservations.value = response.data.data;
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

  const loadDependencies = async () => {
    try {
      const custResp = await customerServices.getCustomers({ status: true, per_page: 100 });
      if (custResp.statusCode === 200) {
        customersList.value = custResp.data.data;
      }
      const prodResp = await inventoryServices.getProducts({ active: true, per_page: 100 });
      if (prodResp.statusCode === 200) {
        productsList.value = prodResp.data.data;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addToCart = async (product: ProductResponse, quantity: number, notes?: string): Promise<boolean> => {
    if (!event_start.value || !event_end.value) {
      alert.showAlert({
        type: 'error',
        title: 'Seleccione las fechas del evento primero',
        show: true,
      });
      return false;
    }

    const startIso = FormatDateToISO(event_start.value as string, 'DD/MM/YYYY hh:mm a', true) || '';
    const endIso = FormatDateToISO(event_end.value as string, 'DD/MM/YYYY hh:mm a', true) || '';

    if (!startIso || !endIso) {
      alert.showAlert({
        type: 'error',
        title: 'Formato de fechas inválido',
        show: true,
      });
      return false;
    }

    const exists = cartItems.value.find((item) => item.id_product === product.id);
    const totalQty = exists ? exists.quantity + quantity : quantity;

    try {
      startLoading();
      const response = await reservationServices.checkAvailability(product.id, startIso, endIso, totalQty);
      if (response && !response.data?.is_available) {
        alert.showAlert({
          type: 'error',
          title: `Stock insuficiente. Disponible: ${response.data?.available_stock || 0}`,
          show: true,
        });
        return false;
      }
    } catch (error) {
      console.error(error);
      alert.showAlert({
        type: 'error',
        title: 'Error verificando disponibilidad',
        show: true,
      });
      return false;
    } finally {
      finishLoading();
    }

    const price = Number(product.rental_price);
    if (exists) {
      exists.quantity += quantity;
      exists.subtotal = exists.quantity * exists.unit_price;
    } else {
      cartItems.value.push({
        id_product: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity,
        unit_price: price,
        subtotal: quantity * price,
        notes,
      });
    }
    return true;
  };

  const removeFromCart = (id_product: string) => {
    cartItems.value = cartItems.value.filter((item) => item.id_product !== id_product);
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  const saveReservation = async (formValues: ReservationForm & { status?: any }) => {
    try {
      startLoading();
      if (!cartItems.value.length) {
        alert.showAlert({
          type: 'error',
          title: 'Debe agregar al menos un artículo a la reserva',
          show: true,
        });
        return null;
      }

      // Convert date/time fields to ISO strings
      const startIso = FormatDateToISO(formValues.event_start, 'DD/MM/YYYY hh:mm a', true) || '';
      const endIso = FormatDateToISO(formValues.event_end, 'DD/MM/YYYY hh:mm a', true) || '';

      const payload: ReservationForm = {
        id_customer: formValues.id_customer,
        event_start: startIso,
        event_end: endIso,
        delivery_address: formValues.delivery_address,
        delivery_address_line2: formValues.delivery_address_line2,
        delivery_zip: formValues.delivery_zip,
        delivery_notes: formValues.delivery_notes,
        id_customer_address: formValues.id_customer_address,
        id_geographic_division: formValues.id_geographic_division,
        total_amount: cartTotal.value,
        deposit_amount: Number(formValues.deposit_amount || 0),
        balance_due: cartBalanceDue.value,
        delivery_fee: Number(formValues.delivery_fee || 0),
        discount_amount: Number(formValues.discount_amount || 0),
        notes: formValues.notes,
        ...(formValues.id ? { status: (typeof formValues.status === 'object' && formValues.status !== null ? (formValues.status as { code: string }).code : formValues.status as string) || 'PENDING' } : {}),
        items: cartItems.value.map((i) => ({
          id_product: i.id_product,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total_price: i.subtotal,
        })),
      };

      let response;
      if (formValues.id) {
        response = await reservationServices.putReservation(formValues.id, payload);
      } else {
        response = await reservationServices.postReservation(payload);
      }

      if (response.status === 201 || response.status === 200) {
        alert.showAlert({
          type: 'success',
          title: 'Reserva guardada con éxito',
          show: true,
        });
        clearCart();
        return response.data;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const changeStatus = async (id: string, action: 'confirm' | 'cancel' | 'in-progress' | 'complete', reasonOrDatetime?: string) => {
    try {
      startLoading();
      let response;
      switch (action) {
        case 'confirm':
          response = await reservationServices.confirmReservation(id);
          break;
        case 'cancel':
          response = await reservationServices.cancelReservation(id, reasonOrDatetime || 'Cancelación de reserva');
          break;
        case 'in-progress':
          response = await reservationServices.markInProgress(id, reasonOrDatetime);
          break;
        case 'complete':
          response = await reservationServices.markCompleted(id, reasonOrDatetime);
          break;
      }
      // Depending on httpClient return type, it usually has statusCode or status
      const res = response as { statusCode?: number; status?: number };
      if (res && (res.statusCode === 200 || res.statusCode === 201 || res.status === 200 || res.status === 201)) {
        getReservations();
        alert.showAlert({
          type: 'success',
          title: 'Estado de reserva actualizado',
          show: true,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const cleanSearch = () => {
    filter.status = undefined;
    filter.id_customer = undefined;
    filter.start_date = undefined;
    filter.end_date = undefined;
    getReservations();
  };

  const debouncedGetReservations = debounce(getReservations, 700);
  const debouncedCleanSearch = debounce(cleanSearch, 700);

  const setReservationItem = (value: ReservationResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('id_customer', value?.id_customer);
    setFieldValue('event_start', FormatDate(value?.event_start, 'DD/MM/YYYY hh:mm a'));
    setFieldValue('event_end', FormatDate(value?.event_end, 'DD/MM/YYYY hh:mm a'));
    setFieldValue('delivery_address', value?.delivery_address);
    setFieldValue('delivery_address_line2', value?.delivery_address_line2);
    setFieldValue('delivery_zip', value?.delivery_zip);
    setFieldValue('delivery_notes', value?.delivery_notes);
    setFieldValue('id_customer_address', value?.id_customer_address);
    setFieldValue('id_geographic_division', value?.id_geographic_division);
    setFieldValue('deposit_amount', Number(value?.deposit_amount));
    setFieldValue('delivery_fee', Number(value?.delivery_fee || 0));
    setFieldValue('discount_amount', Number(value?.discount_amount || 0));
    setFieldValue('notes', value?.notes);
    setFieldValue('status', value?.status);

    delivery_datetime.value = value?.delivery_datetime;
    pickup_datetime.value = value?.pickup_datetime;

    // Populate cart
    cartItems.value = (value?.items || []).map((i) => ({
      id_product: i.id_product,
      product_name: i.mnt_product?.name || 'Producto',
      sku: i.mnt_product?.sku || '',
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      subtotal: Number(i.total_price),
      notes: i.notes,
    }));
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
    values,
    id, idAttrs,
    id_customer, idCustomerAttrs,
    event_start, eventStartAttrs,
    event_end, eventEndAttrs,
    delivery_address, deliveryAddressAttrs,
    delivery_address_line2, deliveryAddressLine2Attrs,
    delivery_zip, deliveryZipAttrs,
    delivery_notes, deliveryNotesAttrs,
    id_customer_address, idCustomerAddressAttrs,
    id_geographic_division, idGeographicDivisionAttrs,
    discount_amount, discountAmountAttrs,
    delivery_fee, deliveryFeeAttrs,
    deposit_amount, depositAmountAttrs,
    notes, notesAttrs,
    status,
    delivery_datetime,
    pickup_datetime,
    getReservations,
    loadDependencies,
    addToCart,
    removeFromCart,
    clearCart,
    saveReservation,
    changeStatus,
    cleanSearch,
    debouncedCleanSearch,
    setReservationItem,
    debouncedGetReservations,
    cartItems,
    cartSubtotal,
    cartTaxAmount,
    cartTotal,
    cartBalanceDue,
    customersList,
    productsList,
    filter,
    pagination,
    reservations,
  };
}
