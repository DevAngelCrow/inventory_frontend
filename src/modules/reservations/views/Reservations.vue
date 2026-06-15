<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section
      id="reservations_content"
      class="w-full xl:w-[95%] flex flex-col flex-wrap gap-5"
    >
      <div class="w-full flex flex-row gap-3 flex-wrap items-center">
        <AppTitle
          title="Reservas y Alquileres"
          class="w-full md:w-auto flex justify-center items-center"
        />
        <div
          id="inputs"
          class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full"
        >
          <AppSelect
            class="w-full sm:w-[200px] min-w-0"
            :options="customerOptions"
            option-label="first_name"
            label="Filtrar por Cliente"
            v-model="filter.id_customer"
            optionValue="id"
          />
          <AppSelect
            class="w-full sm:w-[150px] min-w-0"
            :options="statusOptions"
            option-label="name"
            label="Estado"
            v-model="filter.status"
            optionValue="value"
          />
          <Button
            class="rounded-md"
            v-debounce:700.click="getReservations"
            >Buscar</Button
          >
          <Button
            class="rounded-md"
            outlined
            v-debounce:700.click="cleanSearch"
            label="Limpiar"
            :icon="iconFilter"
          ></Button>
          <Button
            class="rounded-md ml-auto"
            @click="navigateToCreate"
            ><i
              class="pi pi-plus-circle flex justify-center items-center text-center mr-1"
              style="font-size: 1.1rem; font-weight: bold"
            ></i
            ><span>Crear Reserva</span></Button
          >
        </div>
      </div>

      <AppDataTable
        class="w-full"
        :headers="headers"
        :items="reservations"
        :paginator="true"
        :per_page="pagination.per_page"
        :total_items="pagination.total_items"
        :page="pagination.page"
        :show-per-page-options="true"
        :per-page-options="[10, 20, 50, 100]"
        @page-update="handlePagination"
        @per-page-update="handlePerPagePagination"
      >
        <template #body-event_start="{ data }">
          {{ FormatDate(data.event_start, 'DD/MM/YYYY hh:mm a') }}
        </template>
        <template #body-total="{ data }">
          ${{ Number(data.total).toFixed(2) }}
        </template>
        <template #body-balance_due="{ data }">
          <span :class="{'text-red-500 font-bold': Number(data.balance_due) > 0}">
            ${{ Number(data.balance_due).toFixed(2) }}
          </span>
        </template>
        <template #body-status="{ data }">
          <AppStatusChip
            :status="getStatusBoolean(data.status)"
            :label="getStatusLabel(data.status)"
          />
        </template>
        <template #body-acciones="{ data }">
          <div class="flex gap-0 justify-center flex-wrap">
            <Button
              class="rounded-full"
              variant="text"
              icon="pi pi-eye"
              @click="navigateToView(data.id)"
              v-tooltip.bottom="'Ver Detalle'"
            ></Button>
            <Button
              class="rounded-full"
              variant="text"
              icon="pi pi-pencil"
              @click="navigateToEdit(data.id)"
              v-tooltip.bottom="'Editar'"
              :disabled="data.status !== 'DRAFT' && data.status !== 'CONFIRMED'"
            ></Button>
            <Button
              v-if="data.status === 'DRAFT'"
              class="rounded-full text-green-600"
              variant="text"
              icon="pi pi-check"
              @click="changeStatus(data.id, 'confirm')"
              v-tooltip.bottom="'Confirmar Alquiler'"
            ></Button>
            <Button
              v-if="data.status === 'CONFIRMED'"
              class="rounded-full text-blue-600"
              variant="text"
              icon="pi pi-truck"
              @click="changeStatus(data.id, 'transit')"
              v-tooltip.bottom="'En camino (Despacho)'"
            ></Button>
            <Button
              v-if="data.status === 'IN_TRANSIT'"
              class="rounded-full text-yellow-600"
              variant="text"
              icon="pi pi-home"
              @click="changeStatus(data.id, 'delivered')"
              v-tooltip.bottom="'Entregado en sitio'"
            ></Button>
            <Button
              v-if="data.status === 'DELIVERED'"
              class="rounded-full text-purple-600"
              variant="text"
              icon="pi pi-directions"
              @click="changeStatus(data.id, 'picked-up')"
              v-tooltip.bottom="'Recogido (post-evento)'"
            ></Button>
            <Button
              v-if="data.status === 'PICKED_UP'"
              class="rounded-full text-teal-600"
              variant="text"
              icon="pi pi-shield"
              @click="openInspectionModal(data)"
              v-tooltip.bottom="'Registrar Inspección de Daños'"
            ></Button>
            <Button
              v-if="data.status === 'DRAFT' || data.status === 'CONFIRMED'"
              class="rounded-full text-red-600"
              variant="text"
              icon="pi pi-ban"
              @click="openCancelDialog(data)"
              v-tooltip.bottom="'Cancelar Reserva'"
            ></Button>
            <Button
              v-if="data.status !== 'DRAFT' && data.status !== 'CANCELLED' && Number(data.balance_due) > 0"
              class="rounded-full text-green-700"
              variant="text"
              icon="pi pi-dollar"
              @click="openPaymentModal(data)"
              v-tooltip.bottom="'Registrar Pago'"
            ></Button>
          </div>
        </template>
      </AppDataTable>
    </section>

    <!-- Dialog for cancel reason -->
    <Dialog v-model:visible="cancelDialog.show" modal title="Cancelar Reserva" :style="{ width: '25rem' }">
      <div class="flex flex-col gap-4 py-2">
        <label for="reason">Motivo de Cancelación</label>
        <InputText id="reason" v-model="cancelDialog.reason" class="w-full" placeholder="Escriba el motivo..." />
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <Button label="Cancelar" outlined severity="secondary" @click="cancelDialog.show = false" />
        <Button label="Confirmar" severity="danger" @click="confirmCancellation" />
      </div>
    </Dialog>

    <!-- Modal for registering payments -->
    <PaymentFormModal
      :modal-state="paymentModal"
      :reservation="selectedReservationForPayment"
      @close-modal="closePaymentModal"
      @payment-registered="getReservations"
    />

    <!-- Modal for registering damage inspections -->
    <InspectionFormModal
      :modal-state="inspectionModal"
      :reservation="selectedReservationForInspection"
      @close-modal="closeInspectionModal"
      @inspection-registered="getReservations"
    />
  </div>
</template>
<script setup lang="ts">
import PaymentFormModal from '../../payments/components/PaymentFormModal.vue';
import InspectionFormModal from '../components/InspectionFormModal.vue';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Dialog, InputText } from 'primevue';

import AppTitle from '@/core/components/AppTitle.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppStatusChip from '@/core/components/AppStatusChip.vue';
import { FormatDate } from '@/core/utils/dates';

import { useReservation } from '../composables/useReservation';
import { ReservationResponse } from '../interfaces/reservation.interfaces';

const router = useRouter();
const reservationInstance = useReservation();

const {
  filter,
  cleanSearch,
  getReservations,
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
  { name: 'Borrador', value: 'DRAFT' },
  { name: 'Confirmado', value: 'CONFIRMED' },
  { name: 'En camino', value: 'IN_TRANSIT' },
  { name: 'Entregado', value: 'DELIVERED' },
  { name: 'Recogido', value: 'PICKED_UP' },
  { name: 'Inspeccionado', value: 'INSPECTED' },
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

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    DRAFT: 'Borrador',
    CONFIRMED: 'Confirmado',
    IN_TRANSIT: 'En camino',
    DELIVERED: 'Entregado',
    PICKED_UP: 'Recogido',
    INSPECTED: 'Inspeccionado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
  };
  return map[status] || status;
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
