import { useForm } from 'vee-validate';
import { ref } from 'vue';
import * as yup from 'yup';

import { useAlertStore, useLoaderStore } from '@/core/store';
import { PaymentMethodResponse, PaymentResponse, PaymentForm } from '../interfaces/payment.interfaces';
import paymentServices from '../Services/payment.services';

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
      if (resp.statusCode === 200) {
        paymentMethodsList.value = resp.data.data.filter((m) => m.active);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadPaymentsForReservation = async (reservationId: string) => {
    try {
      startLoading();
      const resp = await paymentServices.getPaymentsByReservation(reservationId);
      reservationPayments.value = resp.data;
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  const submitPayment = async (form: PaymentForm) => {
    try {
      startLoading();
      const response = await paymentServices.registerPayment(form);
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

  const voidExistingPayment = async (id: string, reservationId: string) => {
    try {
      startLoading();
      const response = await paymentServices.voidPayment(id);
      if (response.status === 200) {
        alert.showAlert({
          type: 'success',
          title: 'Pago anulado con éxito',
          show: true,
        });
        await loadPaymentsForReservation(reservationId);
        return true;
      }
    } catch (error) {
      console.error(error);
    } finally {
      finishLoading();
    }
  };

  return {
    errors,
    defineField,
    handleSubmit,
    resetForm,
    setFieldValue,
    loadPaymentMethods,
    loadPaymentsForReservation,
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
  };
}
