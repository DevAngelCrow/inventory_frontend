<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section id="reservations_content" class="w-full xl:w-[95%] flex flex-col flex-wrap gap-5">
      <div class="w-full flex flex-row gap-3 flex-wrap items-center">
        <AppTitle title="Reservas y Alquileres" class="w-full md:w-auto flex justify-center items-center" />
        <div id="inputs" class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full">
          <AppSelect class="min-w-auto w-full sm:w-[20%] grow lg:grow-0 shrink-0 md:w-30 lg:w-45" :options="customerOptions" option-label="first_name"
            label="Filtrar por Cliente" v-model="filter.id_customer" optionValue="id" />
          <AppSelect class="w-full sm:w-[20%] grow lg:grow-0 shrink-0 md:w-30 lg:w-45 min-w-0" :options="statusOptions" option-label="name" label="Estado"
            v-model="filter.status" optionValue="value" />
          <AppDatePicker class="w-full sm:w-[20%] grow lg:grow-0 shrink-0 md:w-30 lg:w-45 min-w-0" id="filter_start_date" label="Fecha Inicio"
            v-model="filter.start_date" />
          <AppDatePicker class="w-full sm:w-[20%] lg:w-auto min-w-0 grow lg:grow-0 shrink-0" id="filter_end_date" label="Fecha Fin"
            v-model="filter.end_date" />
          <Button class="shrink-0 grow md:grow-0 rounded-md" @click="debouncedGetReservations">Buscar</Button>
          <Button class="shrink-0 grow md:grow-0 rounded-md" outlined @click="debouncedCleanSearch" label="Limpiar"
            :icon="iconFilter"></Button>
          <Button class="shrink-0 grow md:grow-0 rounded-md ml-auto" @click="navigateToCreate"><i
              class="pi pi-plus-circle flex justify-center items-center text-center mr-1"
              style="font-size: 1.1rem; font-weight: bold"></i><span>Crear Reserva</span></Button>
        </div>
      </div>

      <AppDataTable class="w-full" :headers="headers" :items="reservations" :paginator="true"
        :per_page="pagination.per_page" :total_items="pagination.total_items" :page="pagination.page"
        :show-per-page-options="true" :per-page-options="[10, 20, 50, 100]" @page-update="handlePagination"
        @per-page-update="handlePerPagePagination">
        <template #body-event_start="{ data }">
          {{ FormatDate(data.event_start, 'DD/MM/YYYY hh:mm a') }}
        </template>
        <template #body-total_amount="{ data }">
          ${{ Number(data.total_amount).toFixed(2) }}
        </template>
        <template #body-balance_due="{ data }">
          <span :class="{ 'text-red-500 font-bold': Number(data.balance_due) > 0 }">
            ${{ Number(data.balance_due).toFixed(2) }}
          </span>
        </template>
        <template #body-status="{ data }">
          <AppChipStatus :label="data?.status?.name" :backgroundColor="data?.status?.state_color"
            :textColor="data?.status?.text_color" />
        </template>
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-start flex-wrap">
            <Button class="rounded-full" variant="text" icon="pi pi-eye" @click="navigateToView(data.id)"
              v-tooltip.bottom="'Ver Detalle'"></Button>
            <Button class="rounded-full" variant="text" icon="pi pi-pencil" @click="navigateToEdit(data.id)"
              v-tooltip.bottom="'Editar'"
              :disabled="data.status?.code !== 'PENDING' && data.status?.code !== 'CONFIRMED'"></Button>
            <Button v-if="data.status?.code === 'PENDING'" class="rounded-full text-green-600" variant="text"
              icon="pi pi-check" @click="confirmAction(data.id, 'confirm')"
              v-tooltip.bottom="'Confirmar Alquiler'"></Button>
            <Button v-if="data.status?.code === 'CONFIRMED'" class="rounded-full text-blue-600" variant="text"
              icon="pi pi-truck" @click="confirmAction(data.id, 'in-progress')"
              v-tooltip.bottom="'Marcar En Progreso'"></Button>
            <Button v-if="data.status?.code === 'IN_PROGRESS'" class="rounded-full text-teal-600" variant="text"
              icon="pi pi-shield" @click="openInspectionModal(data)"
              v-tooltip.bottom="'Registrar Inspección de Daños'"></Button>
            <Button v-if="data.status?.code === 'IN_PROGRESS'" class="rounded-full text-purple-600" variant="text"
              icon="pi pi-flag-fill" @click="confirmAction(data.id, 'complete')"
              v-tooltip.bottom="'Completar Reserva'"></Button>
            <Button
              v-if="data.status?.code === 'PENDING' || data.status?.code === 'CONFIRMED' || data.status?.code === 'IN_PROGRESS'"
              class="rounded-full text-red-600" variant="text" icon="pi pi-ban" @click="openCancelDialog(data)"
              v-tooltip.bottom="'Cancelar Reserva'"></Button>
            <Button
              v-if="data.status?.code !== 'PENDING' && data.status?.code !== 'CANCELLED' && Number(data.balance_due) > 0"
              class="rounded-full text-green-700" variant="text" icon="pi pi-dollar" @click="openPaymentModal(data)"
              v-tooltip.bottom="'Registrar Pago'"></Button>
          </div>
        </template>
      </AppDataTable>
    </section>

    <!-- Dialog for cancel reason -->
    <AppModal :show="cancelDialog.show" title="Cancelar Reserva" title-btn-confirm="Confirmar"
      title-btn-cancel="Cancelar" width="25rem" @close-modal="cancelDialog.show = false"
      @update:show="(val: boolean) => cancelDialog.show = val" @confirm-modal="confirmCancellation">
      <div class="flex flex-col gap-4 py-2">
        <label for="reason">Motivo de Cancelación</label>
        <InputText id="reason" v-model="cancelDialog.reason" class="w-full" placeholder="Escriba el motivo..." />
      </div>
    </AppModal>

    <!-- Modal for registering payments -->
    <PaymentFormModal :modal-state="paymentModal" :reservation="selectedReservationForPayment"
      @close-modal="closePaymentModal" @payment-registered="getReservations" />

    <!-- Modal for registering damage inspections -->
    <InspectionFormModal :modal-state="inspectionModal" :reservation="selectedReservationForInspection"
      @close-modal="closeInspectionModal" @inspection-registered="getReservations" />
    <!-- Modal for action confirmations -->
    <AppModal :show="actionModal.show" :title="actionModal.title" title-btn-confirm="Confirmar"
      title-btn-cancel="Cancelar" width="30rem" @close-modal="actionModal.show = false"
      @update:show="(val: boolean) => actionModal.show = val" @confirm-modal="executeAction">
      <div class="flex flex-col gap-4 py-4">
        <div class="text-center text-lg">
          {{ actionModal.message }}
        </div>
        <div v-if="actionModal.action === 'in-progress' || actionModal.action === 'complete'" class="flex flex-col gap-2 mt-4 text-left">
          <label for="action_datetime">{{ actionModal.action === 'in-progress' ? 'Fecha y Hora de Entrega' : 'Fecha y Hora de Recolección' }}</label>
          <AppDatePicker id="action_datetime" v-model="actionModal.datetime" :showTime="true" />
        </div>
      </div>
    </AppModal>
  </div>
</template>
<script setup lang="ts">
import PaymentFormModal from '../../payments/components/PaymentFormModal.vue';
import InspectionFormModal from '../components/InspectionFormModal.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, InputText } from 'primevue';

import AppTitle from '@/core/components/AppTitle.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppChipStatus from '@/core/components/AppChipStatus.vue';
import AppDatePicker from '@/core/components/AppDatePicker.vue';
import { FormatDate, CreateDateFromFormat, getToday } from '@/core/utils/dates';

import { useReservation } from '../composables/useReservation';
import { ReservationResponse } from '../interfaces/reservation.interfaces';

const router = useRouter();
const reservationInstance = useReservation();

const {
  filter,
  cleanSearch,
  debouncedCleanSearch,
  getReservations,
  debouncedGetReservations,
  loadDependencies,
  changeStatus,
  headers,
  pagination,
  reservations,
  customersList,
} = reservationInstance;

const cancelDialog = reactive({
  show: false,
  id: '',
  reason: '',
});

const statusOptions = ref<{ name: string; value: string | null | 'Todos' }[]>([
  { name: 'Todos', value: 'Todos' },
  { name: 'Pendiente', value: 'PENDING' },
  { name: 'Confirmado', value: 'CONFIRMED' },
  { name: 'En Progreso', value: 'IN_PROGRESS' },
  { name: 'Completado', value: 'COMPLETED' },
  { name: 'Cancelado', value: 'CANCELLED' },
]);

const customerOptions = computed(() => {
  return [
    { id: 'Todos', first_name: 'Todos' },
    ...customersList.value,
  ];
});

const getStatusBoolean = (status: string): boolean => {
  return status !== 'CANCELLED';
};



const navigateToCreate = () => {
  router.push({ name: 'reservation-detail' });
};

const navigateToView = (id: string) => {
  router.push({ name: 'reservation-detail', params: { id }, query: { mode: 'view' } });
};

const navigateToEdit = (id: string) => {
  router.push({ name: 'reservation-detail', params: { id } });
};

const openCancelDialog = (data: ReservationResponse) => {
  cancelDialog.id = data.id;
  cancelDialog.reason = '';
  cancelDialog.show = true;
};

const confirmCancellation = async () => {
  if (!cancelDialog.reason.trim()) return;
  await changeStatus(cancelDialog.id, 'cancel', cancelDialog.reason);
  cancelDialog.show = false;
};

const actionModal = reactive({
  show: false,
  id: '',
  action: '' as 'confirm' | 'in-progress' | 'complete',
  title: '',
  message: '',
  datetime: '',
});

const confirmAction = (id: string, action: 'confirm' | 'in-progress' | 'complete') => {
  const map: Record<string, { header: string; message: string }> = {
    'confirm': { header: 'Confirmar Alquiler', message: '¿Estás seguro de que deseas confirmar esta reserva?' },
    'in-progress': { header: 'Marcar En Progreso', message: '¿Estás seguro de marcar esta reserva en progreso?' },
    'complete': { header: 'Completar Reserva', message: '¿Estás seguro de marcar esta reserva como completada?' },
  };
  const config = map[action];
  actionModal.id = id;
  actionModal.action = action;
  actionModal.title = config.header;
  actionModal.message = config.message;
  actionModal.datetime = getToday('DD/MM/YYYY hh:mm a');
  actionModal.show = true;
};

const executeAction = async () => {
  let datetimeParam = undefined;
  if ((actionModal.action === 'in-progress' || actionModal.action === 'complete') && actionModal.datetime) {
    const dateObj = CreateDateFromFormat(actionModal.datetime, 'DD/MM/YYYY hh:mm a');
    if (dateObj) {
      datetimeParam = dateObj.toISOString();
    }
  }
  await changeStatus(actionModal.id, actionModal.action, datetimeParam);
  actionModal.show = false;
};

// Payment Modal State
const paymentModal = reactive({
  show: false,
  mode: 'add' as 'add' | 'view',
  title: 'Registrar Pago de Reserva',
});
const selectedReservationForPayment = ref<ReservationResponse | null>(null);

const openPaymentModal = (data: ReservationResponse) => {
  selectedReservationForPayment.value = data;
  paymentModal.show = true;
};

const closePaymentModal = () => {
  paymentModal.show = false;
  selectedReservationForPayment.value = null;
};

// Inspection Modal State
const inspectionModal = reactive({
  show: false,
  mode: 'add' as 'add' | 'view',
  title: 'Registrar Inspección de Daños',
});
const selectedReservationForInspection = ref<ReservationResponse | null>(null);

const openInspectionModal = (data: ReservationResponse) => {
  selectedReservationForInspection.value = data;
  inspectionModal.show = true;
};

const closeInspectionModal = () => {
  inspectionModal.show = false;
  selectedReservationForInspection.value = null;
};

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) {
    return;
  }
  pagination.page = page + 1;
  getReservations();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  getReservations();
};

const iconFilter = computed(() => {
  const filterValues = Object.values(filter).some(v => v !== undefined);
  if (!filterValues) {
    return 'pi pi-filter';
  }
  return 'pi pi-filter-slash';
});

onMounted(async () => {
  await loadDependencies();
  await getReservations();
});
</script>
