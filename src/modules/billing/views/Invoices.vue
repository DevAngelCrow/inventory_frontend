<template>
  <AppTitle title="Facturación" />
  <div class="w-full flex flex-col gap-6">
    <Card>
      <template #content>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Listado de Facturas</h2>
          <div class="flex gap-2">
            <!-- Add future filters here -->
          </div>
        </div>

        <AppDataTable :headers="headers" :items="invoices" :loading="loading">
          <template #body-status="{ data }">
            <AppChipStatus
              :label="data?.status?.name || 'Desconocido'"
              :backgroundColor="data?.status?.state_color || '#cccccc'"
              :textColor="data?.status?.text_color || '#ffffff'"
            />
          </template>
          <template #body-total="{ data }">
            ${{ Number(data.total).toFixed(2) }}
          </template>
          <template #body-issue_date="{ data }">
            {{ formatDate(data.issue_date) }}
          </template>
          <template #body-customer="{ data }">
            {{ data.mnt_customer?.first_name }} {{ data.mnt_customer?.last_name }}
          </template>

          <template #body-acciones="{ data }">
            <div class="flex gap-2">
              <Button v-if="data.status?.code === 'DRAFT'" icon="pi pi-check-circle"
                class="p-button-success p-button-sm p-button-text" v-tooltip.top="'Emitir Factura'"
                @click="onIssue(data)" />
              <Button v-if="data.status?.code === 'ISSUED'" icon="pi pi-times-circle"
                class="p-button-danger p-button-sm p-button-text" v-tooltip.top="'Anular Factura'"
                @click="onVoid(data)" />
              <Button icon="pi pi-file-pdf" class="p-button-secondary p-button-sm p-button-text"
                v-tooltip.top="'Descargar PDF'" @click="onDownload(data)" />
            </div>
          </template>
        </AppDataTable>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Card, Button } from 'primevue';
import AppTitle from '@/core/components/AppTitle.vue';
import AppDataTable from '@/core/components/AppDataTable.vue';
import AppChipStatus from '@/core/components/AppChipStatus.vue';
import dayjs from 'dayjs';
import { useInvoice } from '../composables/useInvoice';
import type { Invoice } from '../interfaces/billing.interfaces';
import type { TableHeaders } from '@/core/interfaces/datatable.interface';

const { loading, invoices, fetchInvoices, issueInvoice, voidInvoice, downloadPdf } = useInvoice();

const headers: TableHeaders[] = [
  { field: 'invoice_number', header: 'N° Factura', sortable: false },
  { field: 'customer', header: 'Cliente', sortable: false },
  { field: 'issue_date', header: 'Fecha Emisión', sortable: false },
  { field: 'total', header: 'Total', sortable: false },
  { field: 'status', header: 'Estado', sortable: false },
  { field: 'acciones', header: 'Acciones', sortable: false }
];

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
};

const onIssue = async (invoice: Invoice) => {
  if (confirm(`¿Seguro que desea emitir la factura ${invoice.invoice_number}?`)) {
    await issueInvoice(invoice.id);
  }
};

const onVoid = async (invoice: Invoice) => {
  if (confirm(`¿Seguro que desea anular la factura ${invoice.invoice_number}?`)) {
    await voidInvoice(invoice.id);
  }
};

const onDownload = async (invoice: Invoice) => {
  await downloadPdf(invoice.id, invoice.invoice_number);
};

onMounted(() => {
  fetchInvoices();
});
</script>
