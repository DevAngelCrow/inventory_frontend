<template>
  <div class="py-5 px-5 h-full max-h-full flex items-start justify-center">
    <section id="payments_content" class="w-full xl:w-[80%] flex flex-row flex-wrap gap-5">
      <AppTitle title="Pagos" class="w-full md:w-auto flex justify-center items-center" />
      <div id="inputs" class="flex rounded-lg py-0.5 px-0.5 gap-3 flex-wrap grow lg:grow-0 w-full">
        <AppInputText v-model="filters.filter_reservation" label="ID Reserva" class="w-full md:w-48"
          @keyup.enter="applyFilters" />
        <AppSelect v-model="filters.filter_status" label="Estado" :options="paymentStatuses" optionLabel="name"
          optionValue="id" class="w-full md:w-48" @change="applyFilters" />
        <Button label="Buscar" icon="pi pi-search" class="p-button-primary" @click="applyFilters" />
        <Button label="Limpiar" icon="pi pi-filter-slash" class="rounded-md" @click="clearFilters" outlined />
      </div>

      <AppDataTable class="w-full" :headers="headers" :items="paymentsList" :paginator="true"
        :per_page="pagination.per_page" :total_items="pagination.total_items" :page="pagination.page"
        :show-per-page-options="true" :per-page-options="[10, 20, 50]" :loading="loader.isLoading"
        @page-update="handlePagination" @per-page-update="handlePerPagePagination">
        <template #body-payment_date="{ data }">
          {{ formatDate(data.payment_date) }}
        </template>
        <template #body-amount="{ data }">
          ${{ Number(data.amount).toFixed(2) }}
        </template>
        <template #body-status="{ data }">
          <AppChipStatus :label="data?.status?.name || 'Desconocido'"
            :backgroundColor="data?.status?.state_color || '#cccccc'"
            :textColor="data?.status?.text_color || '#ffffff'" />
        </template>
        <template #body-reservation="{ data }">
          {{ data.mnt_reservation?.reservation_number || data.id_reservation }}
        </template>

        <template #body-acciones="{ data }">
          <div class="flex gap-2">
            <Button v-if="data.status?.code !== 'VOIDED'" icon="pi pi-ban"
              class="p-button-danger p-button-sm p-button-text" v-tooltip.top="'Anular Pago'" @click="onVoid(data)" />
          </div>
        </template>
      </AppDataTable>
    </section>

    <AppModal :show="actionModal.show" :title="actionModal.title" title-btn-confirm="Confirmar"
      title-btn-cancel="Cancelar" width="30rem" @close-modal="actionModal.show = false"
      @update:show="(val: boolean) => actionModal.show = val" @confirm-modal="executeAction">
      <div class="py-4 text-center text-lg">
        {{ actionModal.message }}
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { Button } from 'primevue';
import AppTitle from '@/core/components/AppTitle.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppChipStatus from '@/core/components/AppChipStatus.vue';
import AppModal from '@/core/components/AppModal.vue';
import AppInputText from '@/core/components/AppInputText.vue';
import AppSelect from '@/core/components/AppSelect.vue';
import { useLoaderStore } from '@/core/store/useLoaderStore';
import dayjs from 'dayjs';
import { usePayment } from '../composables/usePayment';
import type { PaymentResponse } from '../interfaces/payment.interfaces';
import type { TableHeaders } from '@/core/interfaces/datatable.interface';

const loader = useLoaderStore();
const { paymentsList, pagination, filters, paymentStatuses, fetchPaymentStatuses, applyFilters, clearFilters, loadAllPayments, voidExistingPayment } = usePayment();

const headers: TableHeaders[] = [
  { field: 'payment_number', header: 'N° Pago', sortable: false },
  { field: 'reservation', header: 'Reserva', sortable: false },
  { field: 'payment_date', header: 'Fecha', sortable: false },
  { field: 'amount', header: 'Monto', sortable: false },
  { field: 'status', header: 'Estado', sortable: false },
  { field: 'acciones', header: 'Acciones', sortable: false }
];

const actionModal = reactive({
  show: false,
  title: '',
  message: '',
  id: '',
});

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY hh:mm A');
};

const onVoid = (payment: PaymentResponse) => {
  actionModal.id = payment.id;
  actionModal.title = 'Anular Pago';
  actionModal.message = `¿Seguro que desea anular el pago por $${Number(payment.amount).toFixed(2)}?`;
  actionModal.show = true;
};

const executeAction = async () => {
  if (actionModal.id) {
    await voidExistingPayment(actionModal.id);
    actionModal.show = false;
  }
};

const handlePagination = async (page: number) => {
  if (page + 1 === pagination.page) return;
  pagination.page = page + 1;
  loadAllPayments();
};

const handlePerPagePagination = async (perPage: number) => {
  if (perPage === pagination.per_page) return;
  pagination.per_page = perPage;
  pagination.page = 1;
  loadAllPayments();
};

onMounted(() => {
  fetchPaymentStatuses();
  loadAllPayments();
});
</script>

<style scoped></style>
