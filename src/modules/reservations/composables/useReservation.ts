import { useForm } from 'vee-validate';
import { computed, nextTick, reactive, ref } from 'vue';
import * as yup from 'yup';

import { TableHeaders } from '@/core/interfaces';
import { useAlertStore, useLoaderStore } from '@/core/store';
import { FormatDateToISO, FormatDate } from '@/core/utils/dates';

import { ReservationResponse, ReservationForm, ReservationItem } from '../interfaces/reservation.interfaces';
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
      delivery_datetime: yup.string().nullable(),
      pickup_datetime: yup.string().nullable(),
      transit_time_minutes: yup.number().typeError('Debe ser número').integer().default(0),
      delivery_address: yup.string().max(500, 'Dirección muy larga').nullable(),
      delivery_city: yup.string().max(100).nullable(),
      delivery_state: yup.string().max(100).nullable(),
      delivery_zip: yup.string().max(20).nullable(),
      delivery_notes: yup.string().nullable(),
      delivery_contact_name: yup.string().max(200).nullable(),
      delivery_contact_phone: yup.string().max(20).nullable(),
      event_type: yup.string().max(100).nullable(),
      venue_name: yup.string().max(200).nullable(),
      discount_amount: yup.number().typeError('Debe ser número').min(0).default(0),
      discount_reason: yup.string().max(255).nullable(),
      delivery_fee: yup.number().typeError('Debe ser número').min(0).default(0),
      deposit_amount: yup.number().typeError('Debe ser número').min(0).default(0),
      notes: yup.string().nullable(),
      internal_notes: yup.string().nullable(),
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
      field: 'total',
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
      alignItems: 'center',
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
  const [delivery_datetime, deliveryDatetimeAttrs] = defineField('delivery_datetime');
  const [pickup_datetime, pickupDatetimeAttrs] = defineField('pickup_datetime');
  const [transit_time_minutes, transitTimeMinutesAttrs] = defineField('transit_time_minutes');
  const [delivery_address, deliveryAddressAttrs] = defineField('delivery_address');
  const [delivery_city, deliveryCityAttrs] = defineField('delivery_city');
  const [delivery_state, deliveryStateAttrs] = defineField('delivery_state');
  const [delivery_zip, deliveryZipAttrs] = defineField('delivery_zip');
  const [delivery_notes, deliveryNotesAttrs] = defineField('delivery_notes');
  const [delivery_contact_name, deliveryContactNameAttrs] = defineField('delivery_contact_name');
  const [delivery_contact_phone, deliveryContactPhoneAttrs] = defineField('delivery_contact_phone');
  const [event_type, eventTypeAttrs] = defineField('event_type');
  const [venue_name, venueNameAttrs] = defineField('venue_name');
  const [discount_amount, discountAmountAttrs] = defineField('discount_amount');
  const [discount_reason, discountReasonAttrs] = defineField('discount_reason');
  const [delivery_fee, deliveryFeeAttrs] = defineField('delivery_fee');
  const [deposit_amount, depositAmountAttrs] = defineField('deposit_amount');
  const [notes, notesAttrs] = defineField('notes');
  const [internal_notes, internalNotesAttrs] = defineField('internal_notes');

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

  const addToCart = (product: ProductResponse, quantity: number, notes?: string) => {
    const exists = cartItems.value.find((item) => item.id_product === product.id);
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
  };

  const removeFromCart = (id_product: string) => {
    cartItems.value = cartItems.value.filter((item) => item.id_product !== id_product);
  };

  const clearCart = () => {
    cartItems.value = [];
  };

  const saveReservation = async (formValues: any) => {
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
      // Event start/end contains time in DD/MM/YYYY hh:mm a
      const startIso = FormatDateToISO(formValues.event_start, 'DD/MM/YYYY hh:mm a', true) || '';
      const endIso = FormatDateToISO(formValues.event_end, 'DD/MM/YYYY hh:mm a', true) || '';
      const deliveryIso = formValues.delivery_datetime
        ? FormatDateToISO(formValues.delivery_datetime, 'DD/MM/YYYY hh:mm a', true) || undefined
        : undefined;
      const pickupIso = formValues.pickup_datetime
        ? FormatDateToISO(formValues.pickup_datetime, 'DD/MM/YYYY hh:mm a', true) || undefined
        : undefined;

      const payload: any = {
        id_customer: formValues.id_customer,
        event_start: startIso,
        event_end: endIso,
        delivery_address: formValues.delivery_address,
        total_amount: cartTotal.value,
        deposit_amount: Number(formValues.deposit_amount || 0),
        balance_due: cartBalanceDue.value,
        notes: formValues.notes,
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

  const changeStatus = async (id: string, action: 'confirm' | 'cancel' | 'transit' | 'delivered' | 'picked-up', reason?: string) => {
    try {
      startLoading();
      let response;
      switch (action) {
        case 'confirm':
          response = await reservationServices.confirmReservation(id);
          break;
        case 'cancel':
          response = await reservationServices.cancelReservation(id, reason || 'Cancelación de reserva');
          break;
        case 'transit':
          response = await reservationServices.markInTransit(id);
          break;
        case 'delivered':
          response = await reservationServices.markDelivered(id);
          break;
        case 'picked-up':
          response = await reservationServices.markPickedUp(id);
          break;
      }
      if (response && (response.status === 200 || response.status === 201)) {
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

  const setReservationItem = (value: ReservationResponse) => {
    setFieldValue('id', value?.id);
    setFieldValue('id_customer', value?.id_customer);
    setFieldValue('event_start', FormatDate(value?.event_start, 'DD/MM/YYYY hh:mm a'));
    setFieldValue('event_end', FormatDate(value?.event_end, 'DD/MM/YYYY hh:mm a'));
    setFieldValue('delivery_datetime', value?.delivery_datetime ? FormatDate(value?.delivery_datetime, 'DD/MM/YYYY hh:mm a') : undefined);
    setFieldValue('pickup_datetime', value?.pickup_datetime ? FormatDate(value?.pickup_datetime, 'DD/MM/YYYY hh:mm a') : undefined);
    setFieldValue('transit_time_minutes', value?.transit_time_minutes);
    setFieldValue('delivery_address', value?.delivery_address);
    setFieldValue('delivery_city', value?.delivery_city);
    setFieldValue('delivery_state', value?.delivery_state);
    setFieldValue('delivery_zip', value?.delivery_zip);
    setFieldValue('delivery_notes', value?.delivery_notes);
    setFieldValue('delivery_contact_name', value?.delivery_contact_name);
    setFieldValue('delivery_contact_phone', value?.delivery_contact_phone);
    setFieldValue('event_type', value?.event_type);
    setFieldValue('venue_name', value?.venue_name);
    setFieldValue('discount_amount', Number(value?.discount_amount));
    setFieldValue('discount_reason', value?.discount_reason);
    setFieldValue('delivery_fee', Number(value?.delivery_fee));
    setFieldValue('deposit_amount', Number(value?.deposit_amount));
    setFieldValue('notes', value?.notes);
    setFieldValue('internal_notes', value?.internal_notes);

    // Populate cart
    cartItems.value = (value?.mnt_reservation_item || []).map((i: any) => ({
      id_product: i.id_product,
      product_name: i.mnt_product?.name || 'Producto',
      sku: i.mnt_product?.sku || '',
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      subtotal: Number(i.subtotal),
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
    delivery_datetime, deliveryDatetimeAttrs,
    pickup_datetime, pickupDatetimeAttrs,
    transit_time_minutes, transitTimeMinutesAttrs,
    delivery_address, deliveryAddressAttrs,
    delivery_city, deliveryCityAttrs,
    delivery_state, deliveryStateAttrs,
    delivery_zip, deliveryZipAttrs,
    delivery_notes, deliveryNotesAttrs,
    delivery_contact_name, deliveryContactNameAttrs,
    delivery_contact_phone, deliveryContactPhoneAttrs,
    event_type, eventTypeAttrs,
    venue_name, venueNameAttrs,
    discount_amount, discountAmountAttrs,
    discount_reason, discountReasonAttrs,
    delivery_fee, deliveryFeeAttrs,
    deposit_amount, depositAmountAttrs,
    notes, notesAttrs,
    internal_notes, internalNotesAttrs,
    getReservations,
    loadDependencies,
    addToCart,
    removeFromCart,
    clearCart,
    saveReservation,
    changeStatus,
    cleanSearch,
    setReservationItem,
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
