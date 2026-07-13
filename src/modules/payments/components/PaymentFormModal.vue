<template>
  <AppModal
    :title="props.modalState.title"
    :show="props.modalState.show"
    title-btn-cancel="Cerrar"
    title-btn-confirm="Registrar Pago"
    footer-buttons
    show-icon-close
    width="50rem"
    @close-modal="closeModal"
    @confirm-modal="onSubMit"
    :showBtnConfirmFooter="props.modalState.mode === 'add' && balanceDue > 0"
  >
    <div class="flex flex-col gap-5 w-full">
      <!-- Reservation summary banner -->
      <div
        class="p-4 bg-gray-50 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm"
      >
        <div>
          <span class="block"
            ><strong>Reserva:</strong>
            {{ reservation?.reservation_number }}</span
          >
          <span class="block"
            ><strong>Cliente:</strong>
            {{ reservation?.mnt_customer?.first_name }}
            {{ reservation?.mnt_customer?.last_name }}</span
          >
        </div>
        <div class="text-right">
          <span class="block text-gray-600"
            >Total Alquiler: ${{
              Number(reservation?.total_amount || 0).toFixed(2)
            }}</span
          >
          <span class="block text-red-600 font-bold"
            >Saldo Pendiente: ${{ Number(balanceDue).toFixed(2) }}</span
          >
        </div>
      </div>

      <!-- Payment Form Fields -->
      <section
        v-if="props.modalState.mode === 'add' && balanceDue > 0"
        id="body_modal"
        class="grid grid-cols-1 md:grid-cols-2 gap-5 py-1.5 w-full border-b pb-6"
      >
        <AppInputMoney
          class="w-full min-w-0"
          id="amount"
          label="Monto a Pagar*"
          v-model="amount"
          :error-messages="errors.amount"
          v-bind="amountAttrs"
          :max="balanceDue"
        />

        <AppSelect
          class="w-full min-w-0"
          id="id_payment_method"
          label="Método de Pago*"
          v-model="id_payment_method"
          :error-messages="errors.id_payment_method"
          v-bind="idPaymentMethodAttrs"
          :options="paymentMethodsList"
          optionLabel="name"
          optionValue="id"
        />

        <AppInputText
          class="w-full min-w-0 md:col-span-2"
          id="reference_number"
          label="Número de Referencia / Comprobante"
          v-model="reference_number"
          :error-messages="errors.reference_number"
          v-bind="referenceNumberAttrs"
        />

        <AppInputextArea
          class="w-full min-w-0 md:col-span-2"
          id="notes"
          label="Notas de Pago"
          v-model="notes"
          :error-messages="errors.notes"
          v-bind="notesAttrs"
        />
      </section>

      <div
        v-else-if="balanceDue <= 0"
        class="text-center p-3 text-green-700 font-semibold bg-green-50 rounded-lg"
      >
        Esta reserva ya se encuentra totalmente cancelada (Saldo $0.00).
      </div>

      <!-- Existing Payments List -->
      <div class="flex flex-col gap-3">
        <h4 class="font-semibold text-base border-b pb-1">
          Historial de Transacciones
        </h4>
        <DataTable :value="reservationPayments" class="p-datatable-sm">
          <Column field="payment_number" header="N° Transacción"></Column>
          <Column field="amount" header="Monto">
            <template #body="{ data }">
              ${{ Number(data.amount).toFixed(2) }}
            </template>
          </Column>
          <Column field="ctl_payment_method.name" header="Método"></Column>
          <Column field="payment_date" header="Fecha">
            <template #body="{ data }">
              {{ FormatDate(data.payment_date, 'DD/MM/YYYY hh:mm a') }}
            </template>
          </Column>
          <Column field="status" header="Estado">
            <template #body="{ data }">
              <span
                :class="
                  data.status?.code === 'COMPLETED'
                    ? 'text-green-600'
                    : 'text-red-500'
                "
              >
                {{
                  data.status?.name ||
                  (data.status?.code === 'COMPLETED' ? 'Completado' : 'Anulado')
                }}
              </span>
            </template>
          </Column>
          <Column
            header="Acciones"
            headerStyle="width: 10%; text-align: center"
            bodyStyle="text-align: center"
          >
            <template #body="{ data }">
              <Button
                v-if="data.status?.code === 'COMPLETED'"
                icon="pi pi-ban"
                severity="danger"
                variant="text"
                rounded
                v-tooltip.bottom="'Anular transacción'"
                @click="voidPayment(data.id)"
              />
            </template>
          </Column>
        </DataTable>
        <div
          v-if="!reservationPayments.length"
          class="text-center py-4 text-gray-500 text-sm"
        >
          No hay pagos registrados para esta reserva.
        </div>
      </div>
    </div>
  </AppModal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { DataTable, Column, Button } from 'primevue';

import AppModal from '@/core/components/AppModal.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppInputMoney from '@/core/components/AppInputMoney.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppInputextArea from '@/core/components/AppInputextArea.vue';
import { useLoaderStore } from '@/core/store';
import { FormatDate } from '@/core/utils/dates';

import { usePayment } from '../composables/usePayment';
import { PaymentForm } from '../interfaces/payment.interfaces';
import { ReservationResponse } from '../../reservations/interfaces/reservation.interfaces';

const props = defineProps<{
  modalState: {
    show: boolean;
    mode: 'add' | 'view';
    title: string;
  };
  reservation: ReservationResponse | null;
}>();

const emit = defineEmits(['close-modal', 'payment-registered']);
const paymentInstance = usePayment();
const { startLoading, finishLoading } = useLoaderStore();

const {
  errors,
  id_payment_method,
  amount,
  reference_number,
  notes,
  idPaymentMethodAttrs,
  amountAttrs,
  referenceNumberAttrs,
  notesAttrs,
  paymentMethodsList,
  reservationPayments,
  loadPaymentMethods,
  loadPaymentsForReservation,
  submitPayment,
  voidExistingPayment,
  handleSubmit,
  resetForm,
  setFieldValue,
} = paymentInstance;

const balanceDue = computed(() => {
  return Number(props.reservation?.balance_due || 0);
});

const currentIdempotencyKey = ref('');

watch(
  () => props.modalState.show,
  async newVal => {
    if (newVal && props.reservation) {
      resetForm();
      setFieldValue('id_reservation', props.reservation.id);
      setFieldValue('amount', balanceDue.value);
      currentIdempotencyKey.value = crypto.randomUUID();
      await loadPaymentMethods();
      await loadPaymentsForReservation(props.reservation.id);
    }
  },
);

const onSubMit = handleSubmit(async values => {
  if (Number(values.amount) > balanceDue.value) return;
  try {
    startLoading();
    const form: PaymentForm = {
      amount: Number(values.amount),
      id_reservation: values.id_reservation,
      id_payment_method: values.id_payment_method,
      reference_number: values.reference_number,
      notes: values.notes,
    };
    const success = await submitPayment(form, currentIdempotencyKey.value);
    if (success) {
      emit('payment-registered');
      emit('close-modal');
    }
  } catch (error) {
    console.error(error);
  } finally {
    finishLoading();
  }
});

const voidPayment = async (paymentId: string) => {
  if (!props.reservation) return;
  const success = await voidExistingPayment(paymentId, props.reservation.id);
  if (success) {
    emit('payment-registered');
  }
};

const closeModal = () => {
  emit('close-modal');
};
</script>
