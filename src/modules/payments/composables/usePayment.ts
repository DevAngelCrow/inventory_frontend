import { useForm } from 'vee-validate';
import { ref, reactive } from 'vue';
import * as yup from 'yup';

import { useAlertStore, useLoaderStore } from '@/core/store';
import { PaymentMethodResponse, PaymentResponse, PaymentForm } from '../interfaces/payment.interfaces';
import paymentServices from '../Services/payment.services';
import catalogServices from '@/modules/catalogs/Services/catalog.services';

export function usePayment() {
  const {
    errors,
    defineField,
    handleSubmit,
    resetForm,
    setFieldValue,
  } = useForm({
    validationSchema: yup.object({
      id_reservation: yup.string().required('La reserva es requerida'),
      id_payment_method: yup.string().required('El método de pago es requerido'),
      amount: yup
        .number()
        .typeError('El monto debe ser un número')
        .required('El monto es requerido')
        .min(0.01, 'El monto debe ser mayor a 0'),
      reference_number: yup.string().nullable(),
      notes: yup.string().nullable(),
    }),
  });

  const paymentMethodsList = ref<PaymentMethodResponse[]>([]);
  const reservationPayments = ref<PaymentResponse[]>([]);
  const paymentsList = ref<PaymentResponse[]>([]);
  const pagination = reactive({
    page: 1,
    per_page: 10,
    total_items: 0,
  });
  const filters = reactive({
    filter_reservation: '',
    filter_status: 'Todos',
  });

  const paymentStatuses = ref<{name: string, id: string | 'Todos'}[]>([{name: 'Todos', id: 'Todos'}]);

  const fetchPaymentStatuses = async () => {
    try {
      const response = await catalogServices.getGlobalStatus({ code_category: 'PAY', per_page: 100 } as unknown as Parameters<typeof catalogServices.getGlobalStatus>[0]);
      if (response && response.data && response.data.data) {
         const statuses = response.data.data.map((s: { name: string; code: string; }) => ({ name: s.name, id: s.code }));
         paymentStatuses.value = [{ name: 'Todos', id: 'Todos' }, ...statuses];
      }
    } catch (error) {
      console.error(error);
    }
  };


  const { startLoading, finishLoading } = useLoaderStore();
  const alert = useAlertStore();

  const [id_reservation, idReservationAttrs] = defineField('id_reservation');
  const [id_payment_method, idPaymentMethodAttrs] = defineField('id_payment_method');
  const [amount, amountAttrs] = defineField('amount');
  const [reference_number, referenceNumberAttrs] = defineField('reference_number');
  const [notes, notesAttrs] = defineField('notes');

  const loadPaymentMethods = async () => {
    try {
      const resp = await paymentServices.getPaymentMethods();
      if (resp && resp.data) {
        paymentMethodsList.value = resp.data.filter((m: PaymentMethodResponse) => m.active);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadPaymentsForReservation = async (reservationId: string) => {
    try {
      startLoading();
      const resp = await paymentServices.getPaymentsByReservation(reservationId);
      if (resp && resp.data && resp.data.data) {
        reservationPayments.value = resp.data.data.map((p: PaymentResponse) => {
          const method = paymentMethodsList.value.find((m: PaymentMethodResponse) => m.id === p.id_payment_method);
          return {
            ...p,
            ctl_payment_method: method ? method : ({ name: 'N/A' } as PaymentMethodResponse)
          };
        });
      } else {
        reservationPayments.value = [];
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const loadAllPayments = async () => {
    try {
      startLoading();
      const params: Record<string, unknown> = {
        page: pagination.page,
        per_page: pagination.per_page,
      };
      if (filters.filter_reservation) {
        params.filter_reservation = filters.filter_reservation;
      }
      if (filters.filter_status && filters.filter_status !== 'Todos') {
        params.filter_status = filters.filter_status;
      }
      const resp = await paymentServices.getPayments(params);
      if (resp && resp.data) {
        paymentsList.value = resp.data.data;
        if (resp.data.total_items !== undefined) {
          pagination.total_items = resp.data.total_items;
          pagination.page = resp.data.current_page;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const submitPayment = async (form: PaymentForm) => {
    try {
      startLoading();
      
      const method = paymentMethodsList.value.find(m => m.id === form.id_payment_method);
      const payload: PaymentForm & { payment_method_code: string; id_currency: string; payment_date: string } = {
        ...form,
        payment_method_code: method ? method.code : 'CASH',
        id_currency: '00000000-0000-0000-0000-000000000000', // Default currency UUID
        payment_date: new Date().toISOString(),
      };
      
      const response = await paymentServices.registerPayment(payload);
      if (response.status === 201 || response.status === 200) {
        alert.showAlert({
          type: 'success',
          title: 'Pago registrado con éxito',
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

  const voidExistingPayment = async (id: string, reservationId?: string) => {
    try {
      startLoading();
      const response = await paymentServices.voidPayment(id);
      if (response.status === 200) {
        alert.showAlert({
          type: 'success',
          title: 'Pago anulado con éxito',
          show: true,
        });
        if (reservationId) {
          await loadPaymentsForReservation(reservationId);
        } else {
          await loadAllPayments();
        }
        return true;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const applyFilters = () => {
    pagination.page = 1;
    loadAllPayments();
  };

  const clearFilters = () => {
    filters.filter_reservation = '';
    filters.filter_status = 'Todos';
    pagination.page = 1;
    loadAllPayments();
  };


  return {
    errors,
    defineField,
    handleSubmit,
    resetForm,
    setFieldValue,
    loadPaymentMethods,
    loadPaymentsForReservation,
    loadAllPayments,
    submitPayment,
    voidExistingPayment,
    id_reservation,
    idReservationAttrs,
    id_payment_method,
    idPaymentMethodAttrs,
    amount,
    amountAttrs,
    reference_number,
    referenceNumberAttrs,
    notes,
    notesAttrs,
    paymentMethodsList,
    reservationPayments,
    paymentsList,
    pagination,
    filters,
    paymentStatuses,
    fetchPaymentStatuses,
    applyFilters,
    clearFilters,
  };
}
