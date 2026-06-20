<template>
  <AppTitle title="Pagos" />
  <div class="w-full flex flex-col gap-6">
    <Card>
      <template #content>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Historial de Pagos</h2>
          <div class="flex gap-2">
            <!-- Add future filters here -->
          </div>
        </div>

        <AppDataTable
          :headers="headers"
          :items="paymentsList"
          :paginator="true"
          :per_page="pagination.per_page"
          :total_items="pagination.total_items"
          :page="pagination.page"
          :show-per-page-options="true"
          :per-page-options="[10, 20, 50]"
          @page-update="handlePagination"
          @per-page-update="handlePerPagePagination"
        >
          <template #body-payment_date="{ data }">
            {{ formatDate(data.payment_date) }}
          </template>
          <template #body-amount="{ data }">
            ${{ Number(data.amount).toFixed(2) }}
          </template>
          <template #body-status="{ data }">
            <Tag :value="data.status?.name" :severity="getStatusSeverity(data.status?.code)" />
          </template>
          <template #body-reservation="{ data }">
            {{ data.mnt_reservation?.reservation_number || data.id_reservation }}
          </template>
          
          <template #body-acciones="{ data }">
            <div class="flex gap-2">
              <Button
                v-if="data.status?.code !== 'VOIDED'"
                icon="pi pi-ban"
                class="p-button-danger p-button-sm p-button-text"
                v-tooltip.top="'Anular Pago'"
                @click="onVoid(data)"
              />
            </div>
          </template>
        </AppDataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, Button, Tag } from 'primevue';
import AppTitle from '@/core/components/AppTitle.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import dayjs from 'dayjs';
import { usePayment } from '../composables/usePayment';
import type { PaymentResponse } from '../interfaces/payment.interfaces';

const { paymentsList, pagination, loadAllPayments, voidExistingPayment } = usePayment();

const headers = [
  { field: 'payment_number', header: 'N° Pago' },
  { field: 'reservation', header: 'Reserva' },
  { field: 'payment_date', header: 'Fecha' },
  { field: 'amount', header: 'Monto' },
  { field: 'status', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' }
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY hh:mm A');
};

const getStatusSeverity = (status: string | undefined) => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'VOIDED': return 'danger';
    case 'PENDING': return 'warn';
    default: return 'info';
  }
};

const onVoid = async (payment: PaymentResponse) => {
  if(confirm(`¿Seguro que desea anular el pago por $${Number(payment.amount).toFixed(2)}?`)) {
    await voidExistingPayment(payment.id);
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
  loadAllPayments();
});
</script>

<style scoped>
</style>
